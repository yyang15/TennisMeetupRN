#!/usr/bin/env python3
"""
TennisMeetup Multi-Agent Orchestrator
Controlled loop: PM → Engineer → QA with stop conditions and metrics.
"""

import json
import os
import subprocess
from datetime import datetime

PROJECT_ROOT = "/Users/yuekunyang/TennisMeetupRN"
LOGS_DIR = os.path.join(PROJECT_ROOT, "agent-loop", "logs")
BACKLOG_PATH = os.path.join(PROJECT_ROOT, "agent-loop", "backlog.json")
STATE_PATH = os.path.join(PROJECT_ROOT, "agent-loop", "state.json")

MAX_ITERATIONS = 3


def log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


def save_log(iteration: int, name: str, content: str) -> str:
    filename = f"iter{iteration}_{name}.json"
    path = os.path.join(LOGS_DIR, filename)
    with open(path, "w") as f:
        f.write(content)
    return path


def load_json(path: str):
    with open(path, "r") as f:
        return json.load(f)


def save_json(path: str, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def run_metrics() -> dict:
    """Run real metrics: TypeScript type-check + file counts."""
    # TypeScript type-check
    tc = subprocess.run(
        ["/usr/local/bin/claude_code/node", "./node_modules/.bin/tsc", "--noEmit"],
        capture_output=True, text=True, cwd=PROJECT_ROOT, timeout=120,
    )
    tc_pass = tc.returncode == 0
    tc_errors = len([l for l in (tc.stdout + tc.stderr).split("\n") if "error TS" in l])

    # Count source files and lines
    src_files = 0
    src_lines = 0
    for root, _, files in os.walk(os.path.join(PROJECT_ROOT, "src")):
        for f in files:
            if f.endswith((".ts", ".tsx")):
                src_files += 1
                with open(os.path.join(root, f)) as fh:
                    src_lines += sum(1 for _ in fh)

    return {
        "timestamp": datetime.now().isoformat(),
        "typecheck_pass": tc_pass,
        "typecheck_errors": tc_errors,
        "src_files": src_files,
        "src_lines": src_lines,
    }


def should_stop(state: dict) -> str | None:
    """Check stop conditions. Returns reason string or None."""
    if state["consecutive_failures"] >= 2:
        return "2 consecutive QA failures"
    if state["no_improvement_rounds"] >= 2:
        return "2 iterations with no improvement"
    return None


def main():
    os.makedirs(LOGS_DIR, exist_ok=True)
    state = load_json(STATE_PATH)
    backlog = load_json(BACKLOG_PATH)

    # Establish baseline on first run
    if state["baseline_metrics"] is None:
        log("Establishing baseline metrics...")
        baseline = run_metrics()
        state["baseline_metrics"] = baseline
        state["last_metrics"] = baseline
        save_json(STATE_PATH, state)
        log(f"Baseline: typecheck={'PASS' if baseline['typecheck_pass'] else 'FAIL'}, "
            f"errors={baseline['typecheck_errors']}, files={baseline['src_files']}, lines={baseline['src_lines']}")

    for i in range(MAX_ITERATIONS):
        iteration = state["iteration_count"] + 1
        log(f"\n{'=' * 60}")
        log(f"ITERATION {iteration}")
        log(f"{'=' * 60}")

        # Check stop conditions
        reason = should_stop(state)
        if reason:
            log(f"⛔ STOPPING: {reason}")
            break

        # PM: pick next open task
        open_tasks = [t for t in backlog if t["status"] == "open"]
        if not open_tasks:
            log("⛔ STOPPING: No open tasks in backlog")
            break

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        open_tasks.sort(key=lambda t: priority_order.get(t.get("priority", "low"), 2))
        task = open_tasks[0]

        # Skip if in last 3 tasks
        if task["title"] in state.get("last_3_tasks", []):
            log(f"Skipping repeated task: {task['title']}")
            task = open_tasks[1] if len(open_tasks) > 1 else None
            if not task:
                log("⛔ STOPPING: All remaining tasks were recently attempted")
                break

        log(f"🎯 PM selected: [{task['priority'].upper()}] {task['title']}")
        task["status"] = "in_progress"
        save_json(BACKLOG_PATH, backlog)

        # Save PM ticket
        save_log(iteration, "pm_ticket", json.dumps(task, indent=2))

        # Metrics before
        before = run_metrics()
        save_log(iteration, "metrics_before", json.dumps(before, indent=2))

        # --- Engineer + QA happen inline in calling context ---
        log(f"🔧 Engineer: implement task in calling context")
        log(f"🧪 QA: validate in calling context")

        state["iteration_count"] = iteration
        save_json(STATE_PATH, state)

    log(f"\n{'=' * 60}")
    log("Agent loop complete.")
    log(f"{'=' * 60}")


if __name__ == "__main__":
    main()
