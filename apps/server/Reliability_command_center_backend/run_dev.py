"""Single-command dev launcher: starts `dagster dev` (pipeline + governance sensor)
and the FastAPI backend together, streams both logs to one terminal, and shuts both
down cleanly on Ctrl+C.

    python run_dev.py

Dagster UI:  http://localhost:3000
API + docs:  http://localhost:8000/docs

Sets DAGSTER_HOME to a stable, in-repo directory (.dagster_home) rather than letting
Dagster fall back to an auto-created temp directory -- an ephemeral tmp dir can get
swept up by an unrelated cleanup pass while dagster dev is still running against it,
breaking its run/sensor storage until restarted.
"""
import os
import signal
import subprocess
import sys
import threading
import time

if os.name == "nt":
    import ctypes
    from ctypes import wintypes

ROOT = os.path.dirname(os.path.abspath(__file__))

DAGSTER_HOME = os.environ.setdefault("DAGSTER_HOME", os.path.join(ROOT, ".dagster_home"))
os.makedirs(DAGSTER_HOME, exist_ok=True)

DAGSTER_PORT = os.environ.get("DAGSTER_PORT", "3000")
API_PORT = os.environ.get("API_PORT", "8000")

DAGSTER_CMD = [sys.executable, "-m", "dagster", "dev", "-m", "reliability_pipeline.definitions", "-p", DAGSTER_PORT]
API_CMD = [sys.executable, "-m", "uvicorn", "reliability_pipeline.api.main:app", "--port", API_PORT]


def _ensure_sample_data():
    from reliability_pipeline.db import DATASPHERE_JSONL, NORTHSTAR_CSV

    if os.path.exists(NORTHSTAR_CSV) and os.path.exists(DATASPHERE_JSONL):
        return
    print("[run_dev] sample supplier files missing -- generating them now...")
    from reliability_pipeline.seed_data import write_sample_files

    write_sample_files()


def _check_env_file():
    if not os.path.exists(os.path.join(ROOT, ".env")):
        print(
            "[run_dev] WARNING: no .env file found. Copy .env.example to .env and fill in "
            "GROQ_API_KEY_1.. (and optionally OPENROUTER_API_KEY) before triggering an incident, "
            "or the LLM call will fail with no fallback available."
        )


def _create_windows_job():
    """A Job Object with KILL_ON_JOB_CLOSE: once assigned, child processes die
    automatically when this script's process exits for ANY reason -- clean Ctrl+C,
    a crash, or someone just closing the terminal window. Without this, children
    spawned with their own process group (needed so Ctrl+C reaches us first, not
    them) are orphaned and keep running invisibly, blocking the ports next time.
    """
    JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000
    JobObjectExtendedLimitInformation = 9

    class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
        _fields_ = [
            ("PerProcessUserTimeLimit", ctypes.c_int64),
            ("PerJobUserTimeLimit", ctypes.c_int64),
            ("LimitFlags", wintypes.DWORD),
            ("MinimumWorkingSetSize", ctypes.c_size_t),
            ("MaximumWorkingSetSize", ctypes.c_size_t),
            ("ActiveProcessLimit", wintypes.DWORD),
            ("Affinity", ctypes.c_size_t),
            ("PriorityClass", wintypes.DWORD),
            ("SchedulingClass", wintypes.DWORD),
        ]

    class IO_COUNTERS(ctypes.Structure):
        _fields_ = [(name, ctypes.c_uint64) for name in (
            "ReadOperationCount", "WriteOperationCount", "OtherOperationCount",
            "ReadTransferCount", "WriteTransferCount", "OtherTransferCount",
        )]

    class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
        _fields_ = [
            ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
            ("IoInfo", IO_COUNTERS),
            ("ProcessMemoryLimit", ctypes.c_size_t),
            ("JobMemoryLimit", ctypes.c_size_t),
            ("PeakProcessMemoryUsed", ctypes.c_size_t),
            ("PeakJobMemoryUsed", ctypes.c_size_t),
        ]

    kernel32 = ctypes.windll.kernel32
    kernel32.CreateJobObjectW.restype = wintypes.HANDLE
    kernel32.CreateJobObjectW.argtypes = [ctypes.c_void_p, ctypes.c_wchar_p]

    job = kernel32.CreateJobObjectW(None, None)
    if not job:
        return None

    info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
    info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    kernel32.SetInformationJobObject(
        job, JobObjectExtendedLimitInformation, ctypes.byref(info), ctypes.sizeof(info)
    )
    return job


def _assign_to_windows_job(job, proc):
    if not job:
        return
    ctypes.windll.kernel32.AssignProcessToJobObject(job, int(proc._handle))


def _stream(proc, label):
    for line in iter(proc.stdout.readline, ""):
        if not line:
            break
        sys.stdout.write(f"[{label}] {line}")
    proc.stdout.close()


def _stop(label, proc):
    if proc.poll() is not None:
        return
    try:
        if os.name == "nt":
            proc.send_signal(signal.CTRL_BREAK_EVENT)
        else:
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except Exception:
        pass
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        print(f"[run_dev] {label} did not exit in time, killing it.")
        try:
            if os.name == "nt":
                proc.kill()
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except Exception:
            proc.kill()


def main():
    sys.path.insert(0, ROOT)
    _check_env_file()
    _ensure_sample_data()

    popen_kwargs = dict(cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    if os.name == "nt":
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        job = _create_windows_job()
    else:
        popen_kwargs["start_new_session"] = True  # own process group, for killpg on shutdown
        job = None

    procs = {
        "dagster": subprocess.Popen(DAGSTER_CMD, **popen_kwargs),
        "api": subprocess.Popen(API_CMD, **popen_kwargs),
    }

    for proc in procs.values():
        _assign_to_windows_job(job, proc)

    for label, proc in procs.items():
        threading.Thread(target=_stream, args=(proc, label), daemon=True).start()

    print(f"[run_dev] Dagster UI:  http://localhost:{DAGSTER_PORT}")
    print(f"[run_dev] API + docs: http://localhost:{API_PORT}/docs")
    print("[run_dev] Press Ctrl+C to stop both.\n")

    try:
        while True:
            for label, proc in procs.items():
                code = proc.poll()
                if code is not None:
                    print(f"\n[run_dev] {label} exited unexpectedly (code {code}) -- stopping everything.")
                    return 1
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\n[run_dev] Shutting down...")
        return 0
    finally:
        for label, proc in procs.items():
            _stop(label, proc)


if __name__ == "__main__":
    sys.exit(main())
