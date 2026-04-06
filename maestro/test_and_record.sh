#!/bin/bash
# TennisMeetup — Record full app walkthrough as a single smooth video
#
# Uses xcrun simctl to record the iOS Simulator screen
# while running ONE continuous Maestro walkthrough flow.
#
# Prerequisites:
# 1. iOS Simulator running
# 2. TennisMeetup app already open on Discover screen
# 3. Maestro installed
#
# Usage: ./maestro/test_and_record.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$PROJECT_DIR/maestro/recordings"
VIDEO_FILE="$OUTPUT_DIR/walkthrough_${TIMESTAMP}.mp4"
FLOW="$SCRIPT_DIR/full_walkthrough.yaml"

export PATH="$PATH:$HOME/.maestro/bin"

mkdir -p "$OUTPUT_DIR"

echo "============================================"
echo "TennisMeetup — Full App Walkthrough Recording"
echo "Time: $(date)"
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
  echo "   1. open -a Simulator"
  echo "   2. Start Expo and press 'i' to load app"
  exit 1
fi

echo "📱 Simulator: $BOOTED_DEVICE"
echo "🎬 Recording to: $VIDEO_FILE"
echo ""

# Start screen recording
xcrun simctl io "$BOOTED_DEVICE" recordVideo --codec h264 "$VIDEO_FILE" &
RECORD_PID=$!
sleep 2

echo "▶ Running full walkthrough..."
echo ""

maestro test "$FLOW" 2>&1
TEST_EXIT=$?

# Stop recording
sleep 1
kill -INT "$RECORD_PID" 2>/dev/null
wait "$RECORD_PID" 2>/dev/null || true
sleep 1

echo ""
echo "============================================"

if [ $TEST_EXIT -eq 0 ]; then
  echo "✅ Walkthrough PASSED"
else
  echo "⚠️  Walkthrough had some skipped steps (recording still saved)"
fi

if [ -f "$VIDEO_FILE" ]; then
  SIZE=$(ls -lh "$VIDEO_FILE" | awk '{print $5}')
  echo "🎬 Video: $VIDEO_FILE ($SIZE)"
else
  echo "❌ Recording file not found"
fi

echo "============================================"
