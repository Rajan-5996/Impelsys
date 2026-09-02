"""Convenience CLI for the acceptance-test flow described in the build spec.

    python scripts/demo_cli.py pending
    python scripts/demo_cli.py approve INC-20260901-80f5546e
    python scripts/demo_cli.py reject INC-20260901-80f5546e
    python scripts/demo_cli.py audit INC-20260901-80f5546e
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from reliability_pipeline import governance  # noqa: E402


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    cmd = sys.argv[1]

    if cmd == "pending":
        for row in governance.list_pending_incidents():
            print(row)

    elif cmd == "approve":
        print(governance.approve_incident(sys.argv[2]))

    elif cmd == "reject":
        print(governance.reject_incident(sys.argv[2]))

    elif cmd == "audit":
        for row in governance.get_audit_trail(sys.argv[2]):
            print(row)

    else:
        print(__doc__)


if __name__ == "__main__":
    main()
