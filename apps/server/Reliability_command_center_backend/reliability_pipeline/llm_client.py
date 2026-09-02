"""Groq key-pool primary, OpenRouter fallback.

This is the only place in the pipeline that calls an LLM. Every other stage
(schema diff, quarantine SQL, uniqueness checks) stays deterministic SQL --
those need to be reliable and auditable, not generated text. This module
powers the root-cause narrative + confidence score written into
audit_log.evidence when customer_validation_asset's check fails.
"""
import itertools
import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_KEYS = [v for k, v in os.environ.items() if k.startswith("GROQ_API_KEY_") and v]
_key_cycle = itertools.cycle(GROQ_KEYS) if GROQ_KEYS else None


def call_groq(prompt: str, model: str = "openai/gpt-oss-120b") -> str:
    if not GROQ_KEYS:
        raise RuntimeError("No GROQ_API_KEY_* values set in the environment")

    last_err = None
    for _ in range(len(GROQ_KEYS)):
        key = next(_key_cycle)
        try:
            client = Groq(api_key=key)
            resp = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
            )
            return resp.choices[0].message.content
        except Exception as e:  # rate limit (429) or transient error -> try next key
            last_err = e
            continue
    raise last_err  # every key in the pool failed


def call_openrouter(prompt: str, model: str = "meta-llama/llama-3.3-70b-instruct") -> str:
    import requests

    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"},
        json={"model": model, "messages": [{"role": "user", "content": prompt}]},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def call_llm(prompt: str) -> str:
    """Groq pool first, OpenRouter only if every Groq key is exhausted."""
    try:
        return call_groq(prompt)
    except Exception:
        return call_openrouter(prompt)
