#!/bin/bash
# TennisMeetup — Full app test with screen recording
# Runs all Maestro flows and records each one as .mp4
#
# Prerequisites:
# 1. iOS Simulator running with Expo app loaded
# 2. Maestro installed ($HOME/.maestro/bin/maestro)
#
# Usage: Run via Claude command /test_and_record
#   or directly: ./maestro/test_and_record.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$PROJECT_DIR/maestro/recordings/$TIMESTAMP"

export PATH="$PATH:$HOME/.maestro/bin"

mkdir -p "$OUTPUT_DIR"

echo "============================================"
echo "TennisMeetup — Test & Record"
echo "Time: $(date)"
echo "Output: $OUTPUT_DIR"
echo "============================================"
echo ""

# Preflight checks
if ! command -v maestro &> /dev/null; then
  echo "❌ Maestro not found. Install: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
  echo "❌ No booted iOS Simulator. Run: open -a Simulator"
  exit 1
fi

PASS=0
FAIL=0
TOTAL=0
RESULTS=""

for flow in "$SCRIPT_DIR"/*.yaml; do
  name=$(basename "$flow" .yaml)
  TOTAL=$((TOTAL + 1))
  recording="$OUTPUT_DIR/${name}.mp4"

  echo "🎬 Recording: $name → $recording"

  if maestro record "$flow" --output "$recording" 2>&1 | tee "$OUTPUT_DIR/${name}.log"; then
    echo "  ✅ PASS: $name"
    PASS=$((PASS + 1))
    RESULTS="$RESULTS\n  ✅ $name → $recording"
  else
    echo "  ❌ FAIL: $name (see $OUTPUT_DIR/${name}.log)"
    FAIL=$((FAIL + 1))
    RESULTS="$RESULTS\n  ❌ $name → FAILED"
  fi
  echo ""
done

echo "============================================"
echo "RESULTS: $PASS/$TOTAL passed, $FAIL failed"
echo -e "$RESULTS"
echo ""
echo "Recordings saved to: $OUTPUT_DIR/"
echo "============================================"

# List all recordings
ls -lh "$OUTPUT_DIR"/*.mp4 2>/dev/null || echo "(no recordings)"

exit $FAIL
