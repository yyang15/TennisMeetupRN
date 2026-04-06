#!/usr/bin/env python3
"""
TennisMeetup Multi-Agent Orchestrator
Controlled loop: PM → Engineer → QA with real Claude CLI execution.

Usage:
  python3 agent-loop/orchestrator.py
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Repo-relative paths
REPO_ROOT = Path(__file__).resolve().parent.parent
AGENT_DIR = REPO_ROOT / "agent-loop"
LOGS_DIR = AGENT_DIR / "logs"
BACKLOG_PATH = AGENT_DIR / "backlog.json"
STATE_PATH = AGENT_DIR / "state.json"
PM_PROMPT = REPO_ROOT / ".claude" / "commands" / "pm.md"
ENGINEER_PROMPT = REPO_ROOT / ".claude" / "commands" / "engineer.md"
QA_PROMPT = REPO_ROOT / ".claude" / "commands" / "qa.md"

MAX_ITERATIONS = 3
CMD_TIMEOUT = 300  # 5 min per agent call
TYPECHECK_TIMEOUT = 120


# ── Helpers ──────────────────────────────────────────────────────────


def log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


def load_json(path: Path) -> dict | list:
    with open(path) as f:
        return json.load(f)


def save_json(path: Path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    f.close()


def save_log(iteration: int, name: str, data) -> Path:
    """Save a log file for this iteration. `data` can be dict/list (→ JSON) or str."""
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    path = LOGS_DIR / f"iter{iteration}_{name}.json"
    content = json.dumps(data, indent=2, ensure_ascii=False) if not isinstance(data, str) else data
    path.write_text(content)
    return path


def extract_json(text: str) -> dict | None:
    """Try to extract the first JSON object from text (may be wrapped in markdown)."""
    # Try raw parse first
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        pass
    # Try to find ```json ... ``` block
    m = re.search(r"```json\s*\n(.*?)\n```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    # Try to find first { ... } block
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass
    return None


# ── Agent Runner ─────────────────────────────────────────────────────


def run_agent(prompt_file: Path, context: str = "") -> str:
    """
    Call Claude CLI with a system prompt file and optional context.
    Returns raw stdout text.
    """
    system_prompt = prompt_file.read_text()
    full_prompt = f"{system_prompt}\n\n---\n\n{context}" if context else system_prompt

    cmd = ["claude", "-p", full_prompt]
    log(f"  Running agent: {prompt_file.name} ...")

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CMD_TIMEOUT,
            cwd=str(REPO_ROOT),
        )
        output = result.stdout.strip() or result.stderr.strip()
        if not output:
            log(f"  ⚠ Agent returned empty output")
        return output
    except FileNotFoundError:
        log("  ❌ 'claude' CLI not found in PATH")
        return ""
    except subprocess.TimeoutExpired:
        log(f"  ❌ Agent timed out after {CMD_TIMEOUT}s")
        return ""


# ── Metrics ──────────────────────────────────────────────────────────


def run_typecheck() -> tuple[bool, int, str]:
    """Run npm run typecheck. Returns (pass, error_count, raw_output)."""
    try:
        result = subprocess.run(
            ["npm", "run", "typecheck"],
            capture_output=True,
            text=True,
            cwd=str(REPO_ROOT),
            timeout=TYPECHECK_TIMEOUT,
        )
    except FileNotFoundError:
        # Fallback: call tsc directly via node
        result = subprocess.run(
            ["node", "./node_modules/.bin/tsc", "--noEmit"],
            capture_output=True,
            text=True,
            cwd=str(REPO_ROOT),
            timeout=TYPECHECK_TIMEOUT,
        )

    raw = result.stdout + result.stderr
    tc_pass = result.returncode == 0
    tc_errors = len([l for l in raw.split("\n") if "error TS" in l])
    return tc_pass, tc_errors, raw


def run_metrics() -> dict:
    """Collect TypeScript type-check + source file/line counts."""
    tc_pass, tc_errors, _ = run_typecheck()

    src_dir = REPO_ROOT / "src"
    src_files = 0
    src_lines = 0
    for p in src_dir.rglob("*.ts*"):
        if p.suffix in (".ts", ".tsx"):
            src_files += 1
            src_lines += len(p.read_text().splitlines())

    return {
        "timestamp": datetime.now().isoformat(),
        "typecheck_pass": tc_pass,
        "typecheck_errors": tc_errors,
        "src_files": src_files,
        "src_lines": src_lines,
    }


# ── Git helpers ──────────────────────────────────────────────────────


def git_snapshot() -> str:
    """Return current HEAD commit hash for potential revert."""
    r = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        capture_output=True, text=True, cwd=str(REPO_ROOT),
    )
    return r.stdout.strip()


def git_revert_to(commit_hash: str):
    """Revert all changes back to a commit (soft reset)."""
    subprocess.run(
        ["git", "checkout", ".", ],
        cwd=str(REPO_ROOT),
    )
    log(f"  Reverted working tree to {commit_hash[:8]}")


# ── Stop conditions ──────────────────────────────────────────────────


def should_stop(state: dict) -> str | None:
    if state.get("consecutive_failures", 0) >= 2:
        return "2 consecutive QA failures"
    if state.get("no_improvement_rounds", 0) >= 2:
        return "2 iterations with no metric improvement"
    return None


# ── Main loop ────────────────────────────────────────────────────────


def main():
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    state = load_json(STATE_PATH)
    backlog = load_json(BACKLOG_PATH)

    # Establish baseline on first run
    if state.get("baseline_metrics") is None:
        log("Establishing baseline metrics...")
        baseline = run_metrics()
        state["baseline_metrics"] = baseline
        state["last_metrics"] = baseline
        save_json(STATE_PATH, state)
        log(f"Baseline: tsc={'PASS' if baseline['typecheck_pass'] else 'FAIL'}, "
            f"errors={baseline['typecheck_errors']}, "
            f"files={baseline['src_files']}, lines={baseline['src_lines']}")

    for _ in range(MAX_ITERATIONS):
        iteration = state.get("iteration_count", 0) + 1
        log(f"\n{'=' * 60}")
        log(f"ITERATION {iteration}")
        log(f"{'=' * 60}")

        # ── Stop conditions ──
        reason = should_stop(state)
        if reason:
            log(f"⛔ STOPPING: {reason}")
            break

        # ── PM: select task ──
        open_tasks = [t for t in backlog if t.get("status") == "open"]
        if not open_tasks:
            log("⛔ STOPPING: No open tasks in backlog")
            break

        priority_order = {"high": 0, "medium": 1, "low": 2}
        open_tasks.sort(key=lambda t: priority_order.get(t.get("priority", "low"), 2))

        # Skip recently attempted tasks
        last_3 = state.get("last_3_tasks", [])
        task = None
        for t in open_tasks:
            if t["title"] not in last_3:
                task = t
                break
        if not task:
            log("⛔ STOPPING: All open tasks were recently attempted")
            break

        log(f"🎯 PM selected: [{task.get('priority', '?').upper()}] {task['title']}")
        task["status"] = "in_progress"
        save_json(BACKLOG_PATH, backlog)

        # Run PM agent for detailed ticket
        pm_context = (
            f"Current backlog task:\n{json.dumps(task, indent=2)}\n\n"
            f"State memory:\n{json.dumps(state.get('successes', [])[-3:], indent=2)}\n\n"
            f"Recent failures to avoid:\n{json.dumps(state.get('failures', [])[-3:], indent=2)}"
        )
        pm_raw = run_agent(PM_PROMPT, pm_context)
        pm_ticket = extract_json(pm_raw) or task  # fallback to backlog task
        save_log(iteration, "pm_ticket", pm_ticket)

        # Check PM confidence
        confidence = pm_ticket.get("confidence", 1.0)
        if confidence < 0.6:
            log(f"⛔ PM confidence too low ({confidence}). Skipping task.")
            task["status"] = "open"
            save_json(BACKLOG_PATH, backlog)
            state["no_improvement_rounds"] = state.get("no_improvement_rounds", 0) + 1
            save_json(STATE_PATH, state)
            continue

        # ── Metrics before ──
        snapshot = git_snapshot()
        before = run_metrics()
        save_log(iteration, "metrics_before", before)

        # ── Engineer: implement ──
        engineer_context = (
            f"PM Ticket:\n{json.dumps(pm_ticket, indent=2)}\n\n"
            f"Validation command: npm run typecheck\n\n"
            f"Rules:\n- Max 5 files\n- Run typecheck after changes\n- Keep dark theme consistent"
        )
        engineer_raw = run_agent(ENGINEER_PROMPT, engineer_context)
        engineer_result = extract_json(engineer_raw) or {"raw_output": engineer_raw}
        save_log(iteration, "engineer_result", engineer_result)

        # ── QA: validate ──
        def run_qa(attempt: int) -> tuple[dict, bool]:
            qa_context = (
                f"PM Ticket:\n{json.dumps(pm_ticket, indent=2)}\n\n"
                f"Engineer Output:\n{json.dumps(engineer_result, indent=2)}\n\n"
                f"Metrics Before:\n{json.dumps(before, indent=2)}\n\n"
                f"Attempt: {attempt}/2"
            )
            qa_raw = run_agent(QA_PROMPT, qa_context)
            qa_result = extract_json(qa_raw) or {"status": "fail", "raw_output": qa_raw}
            passed = qa_result.get("status", "").lower() == "pass"

            # Also verify typecheck ourselves
            tc_pass, tc_errors, tc_raw = run_typecheck()
            qa_result["orchestrator_typecheck"] = "pass" if tc_pass else "fail"
            qa_result["orchestrator_typecheck_errors"] = tc_errors
            if not tc_pass:
                qa_result["status"] = "fail"
                qa_result["typecheck_output"] = tc_raw
                passed = False

            return qa_result, passed

        qa_result, qa_passed = run_qa(attempt=1)

        # ── Retry on failure ──
        if not qa_passed:
            log("  ❌ QA FAILED (attempt 1). Retrying engineer...")
            retry_context = (
                f"QA FAILED. Fix the issues and try again.\n\n"
                f"QA Feedback:\n{json.dumps(qa_result, indent=2)}\n\n"
                f"Original PM Ticket:\n{json.dumps(pm_ticket, indent=2)}"
            )
            engineer_raw = run_agent(ENGINEER_PROMPT, retry_context)
            engineer_result_retry = extract_json(engineer_raw) or {"raw_output": engineer_raw}
            save_log(iteration, "engineer_result_retry", engineer_result_retry)

            qa_result, qa_passed = run_qa(attempt=2)

        save_log(iteration, "qa_result", qa_result)

        # ── Metrics after ──
        after = run_metrics()
        save_log(iteration, "metrics_after", after)

        # ── Handle result ──
        if qa_passed:
            log("  ✅ QA PASSED")
            task["status"] = "done"
            task["completed_at"] = datetime.now().strftime("%Y-%m-%d")
            task["agent_iteration"] = iteration
            state["consecutive_failures"] = 0

            # Check for improvement
            improved = (
                after["typecheck_errors"] <= before["typecheck_errors"]
                and after["typecheck_pass"]
            )
            if not improved:
                state["no_improvement_rounds"] = state.get("no_improvement_rounds", 0) + 1
            else:
                state["no_improvement_rounds"] = 0

            # Record success
            successes = state.get("successes", [])
            successes.append({
                "task": task["title"],
                "pattern": engineer_result.get("explanation", ""),
                "impact": f"lines: {before['src_lines']} → {after['src_lines']}",
            })
            state["successes"] = successes

            state["last_metrics"] = after
        else:
            log("  ❌ QA FAILED (attempt 2). Reverting changes.")
            git_revert_to(snapshot)
            task["status"] = "failed"
            state["consecutive_failures"] = state.get("consecutive_failures", 0) + 1

            # Record failure
            failures = state.get("failures", [])
            failures.append({
                "task": task["title"],
                "reason": qa_result.get("summary", "Unknown"),
                "pattern": "QA failed after 1 retry",
            })
            state["failures"] = failures

        # ── Update tracking ──
        last_3 = state.get("last_3_tasks", [])
        last_3.append(task["title"])
        state["last_3_tasks"] = last_3[-3:]
        state["iteration_count"] = iteration

        save_json(BACKLOG_PATH, backlog)
        save_json(STATE_PATH, state)

        log(f"  Iteration {iteration} complete.\n")

    # ── Summary ──
    log(f"\n{'=' * 60}")
    log("Agent loop complete.")
    done = sum(1 for t in backlog if t.get("status") == "done")
    failed = sum(1 for t in backlog if t.get("status") == "failed")
    log(f"Tasks: {done} done, {failed} failed, {len(backlog) - done - failed} remaining")
    log(f"{'=' * 60}")


if __name__ == "__main__":
    main()
