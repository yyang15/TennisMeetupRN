#!/bin/bash
# Run all Maestro test flows with screen recording
# Usage: ./maestro/run_tests.sh
# Prerequisites: Maestro installed, Expo app running in iOS Simulator

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_DIR/maestro/recordings"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

export PATH="$PATH:$HOME/.maestro/bin"

mkdir -p "$OUTPUT_DIR"

echo "============================================"
echo "TennisMeetup — Maestro Test Suite"
echo "============================================"
echo ""

# Check Maestro
if ! command -v maestro &> /dev/null; then
  echo "❌ Maestro not found. Run: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

# Check simulator
if ! xcrun simctl list devices booted 2>/dev/null | grep -q "Booted"; then
  echo "❌ No booted iOS Simulator found. Start one in Xcode or run:"
  echo "   open -a Simulator"
  exit 1
fi

echo "📱 Simulator detected"
echo "📁 Output: $OUTPUT_DIR"
echo ""

PASS=0
FAIL=0
TOTAL=0

for flow in "$SCRIPT_DIR"/*.yaml; do
  name=$(basename "$flow" .yaml)
  TOTAL=$((TOTAL + 1))

  echo "▶ Running: $name"

  if maestro test "$flow" \
    --format junit \
    --output "$OUTPUT_DIR/${TIMESTAMP}_${name}_report.xml" \
    2>&1 | tee "$OUTPUT_DIR/${TIMESTAMP}_${name}.log"; then
    echo "  ✅ PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL: $name"
    FAIL=$((FAIL + 1))
  fi
  echo ""
done

# Collect screenshots
if [ -d ~/.maestro/tests ]; then
  cp -r ~/.maestro/tests/screenshots "$OUTPUT_DIR/${TIMESTAMP}_screenshots" 2>/dev/null || true
fi

echo "============================================"
echo "Results: $PASS/$TOTAL passed, $FAIL failed"
echo "Screenshots: $OUTPUT_DIR/"
echo "============================================"

exit $FAIL
