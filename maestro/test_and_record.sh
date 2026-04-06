#!/bin/bash
# TennisMeetup — Record full app test as a single video
#
# Uses xcrun simctl to record the iOS Simulator screen
# while running Maestro test flows sequentially.
#
# Prerequisites:
# 1. iOS Simulator running
# 2. TennisMeetup app already open in Simulator
# 3. Maestro installed
#
# Usage: ./maestro/test_and_record.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$PROJECT_DIR/maestro/recordings"
VIDEO_FILE="$OUTPUT_DIR/full_test_${TIMESTAMP}.mp4"

export PATH="$PATH:$HOME/.maestro/bin"

mkdir -p "$OUTPUT_DIR"

echo "============================================"
echo "TennisMeetup — Full App Test & Record"
echo "Time: $(date)"
echo "Output: $VIDEO_FILE"
echo "============================================"
echo ""

# Preflight
if ! command -v maestro &> /dev/null; then
  echo "❌ Maestro not found. Install: curl -Ls https://get.maestro.mobile.dev | bash"
  exit 1
fi

BOOTED_DEVICE=$(xcrun simctl list devices booted -j 2>/dev/null | python3 -c "
import json,sys
data=json.load(sys.stdin)
for runtime,devices in data.get('devices',{}).items():
  for d in devices:
    if d.get('state')=='Booted':
      print(d['udid'])
      sys.exit(0)
" 2>/dev/null)

if [ -z "$BOOTED_DEVICE" ]; then
  echo "❌ No booted iOS Simulator found."
  echo "   Run: open -a Simulator"
  echo "   Then start the app in Simulator (press 'i' in Metro terminal)"
  exit 1
fi

echo "📱 Simulator: $BOOTED_DEVICE"
echo "🎬 Starting screen recording..."
echo ""

# Start screen recording in background
xcrun simctl io "$BOOTED_DEVICE" recordVideo --codec h264 "$VIDEO_FILE" &
RECORD_PID=$!

# Give recorder a moment to start
sleep 2

PASS=0
FAIL=0
TOTAL=0

for flow in "$SCRIPT_DIR"/*.yaml; do
  [ "$(basename "$flow")" = "config.yaml" ] && continue
  name=$(basename "$flow" .yaml)
  TOTAL=$((TOTAL + 1))

  echo "▶ Running: $name"
  if maestro test "$flow" 2>&1 | tee "$OUTPUT_DIR/${name}_${TIMESTAMP}.log" | grep -E "✅|❌|PASSED|FAILED"; then
    echo "  ✅ PASS"
    PASS=$((PASS + 1))
  else
    echo "  ❌ FAIL"
    FAIL=$((FAIL + 1))
  fi
  echo ""

  # Brief pause between flows for visual clarity
  sleep 1
done

# Stop recording
echo "🛑 Stopping recording..."
kill -INT "$RECORD_PID" 2>/dev/null
wait "$RECORD_PID" 2>/dev/null || true
sleep 1

echo ""
echo "============================================"
echo "RESULTS: $PASS/$TOTAL passed, $FAIL failed"
echo ""

if [ -f "$VIDEO_FILE" ]; then
  SIZE=$(ls -lh "$VIDEO_FILE" | awk '{print $5}')
  echo "🎬 Recording: $VIDEO_FILE ($SIZE)"
else
  echo "⚠️  Recording file not found"
fi

echo "============================================"

exit $FAIL
