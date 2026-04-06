#!/usr/bin/env python3
"""
TennisMeetup Multi-Agent Orchestrator
Runs one iteration of: PM → Engineer → QA
"""

import json
import os
import subprocess
import sys
from datetime import datetime

PROJECT_ROOT = "/Users/yuekunyang/TennisMeetupRN"
LOGS_DIR = os.path.join(PROJECT_ROOT, "agent-loop", "logs")
BACKLOG_PATH = os.path.join(PROJECT_ROOT, "agent-loop", "backlog.json")

def log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")

def save_log(name: str, content: str):
    path = os.path.join(LOGS_DIR, f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{name}.md")
    with open(path, "w") as f:
        f.write(content)
    log(f"Saved log: {path}")
    return path

def run_claude(prompt: str, system_file: str = None) -> str:
    """Run Claude CLI with a prompt. Returns stdout."""
    cmd = ["claude", "-p", prompt]
    if system_file:
        cmd.extend(["--system", system_file])
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=PROJECT_ROOT,
        )
        return result.stdout or result.stderr
    except FileNotFoundError:
        log("ERROR: 'claude' CLI not found. Running agents inline instead.")
        return ""
    except subprocess.TimeoutExpired:
        return "ERROR: Claude CLI timed out after 5 minutes"

def run_typecheck() -> tuple[bool, str]:
    """Run TypeScript type-check. Returns (success, output)."""
    cmd = [
        "/usr/local/bin/claude_code/node",
        "./node_modules/.bin/tsc",
        "--noEmit",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=PROJECT_ROOT)
    return result.returncode == 0, result.stdout + result.stderr

def main():
    os.makedirs(LOGS_DIR, exist_ok=True)
    log("=" * 60)
    log("TennisMeetup Agent Loop - Starting Iteration")
    log("=" * 60)

    # ---- PHASE 1: PM ----
    log("\n🎯 PHASE 1: PM Agent — Identifying task...")
    pm_prompt = open(os.path.join(PROJECT_ROOT, ".claude/commands/pm.md")).read()
    pm_output = run_claude(pm_prompt)

    if not pm_output:
        log("Claude CLI unavailable. Using pre-defined PM ticket.")
        pm_output = json.dumps({
            "title": "Add discard confirmation when leaving Create Session with unsaved changes",
            "problem": "User can fill out half the Create Session form and tap Back, losing all input with no warning",
            "goal": "Show a confirmation dialog when user tries to leave Create Session with any filled fields",
            "acceptance_criteria": [
                "Tapping back with empty form navigates back immediately",
                "Tapping back with any filled field shows confirmation dialog",
                "Dialog has Cancel and Discard options",
                "Cancel keeps user on form, Discard navigates back",
                "TypeScript type-check passes"
            ],
            "files_likely_involved": [
                "src/screens/CreateSessionScreen.tsx"
            ],
            "risk": "low — single file change, uses existing Alert API",
            "confidence": 0.95
        }, indent=2)

    save_log("pm_ticket", f"# PM Agent Output\n\n```json\n{pm_output}\n```")
    log(f"PM ticket generated")

    # ---- PHASE 2: Engineer ----
    log("\n🔧 PHASE 2: Engineer Agent — Implementing...")
    # (Implementation happens inline in the calling context)
    save_log("engineer_start", "# Engineer Agent\n\nImplementing PM ticket...")

    # ---- PHASE 3: QA ----
    log("\n🧪 PHASE 3: QA Agent — Validating...")
    tc_ok, tc_output = run_typecheck()
    qa_result = {
        "typecheck": "pass" if tc_ok else "fail",
        "typecheck_output": tc_output,
    }
    save_log("qa_typecheck", f"# QA Type-Check\n\nStatus: {'PASS' if tc_ok else 'FAIL'}\n\n```\n{tc_output}\n```")

    if tc_ok:
        log("✅ QA: TypeScript type-check PASSED")
    else:
        log("❌ QA: TypeScript type-check FAILED")
        log(tc_output)

    log("\n" + "=" * 60)
    log("Iteration complete.")
    log("=" * 60)

if __name__ == "__main__":
    main()
