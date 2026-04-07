#!/bin/bash
# TennisMeetup — Record app walkthrough
#
# Run this in YOUR terminal (not via Devmate):
#   ./maestro/test_and_record.sh
#
# It will:
# 1. Record the iOS Simulator screen
# 2. Run Maestro walkthrough
# 3. Save video to maestro/recordings/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="$PROJECT_DIR/maestro/recordings"
VIDEO="$OUTPUT_DIR/walkthrough_${TIMESTAMP}.mov"

export PATH="$PATH:$HOME/.maestro/bin"
mkdir -p "$OUTPUT_DIR"

# Check prereqs
command -v maestro >/dev/null || { echo "❌ Maestro not found"; exit 1; }

DEVICE=$(xcrun simctl list devices booted -j | python3 -c "
import json,sys
for r,devs in json.load(sys.stdin)['devices'].items():
  for d in devs:
    if d['state']=='Booted': print(d['udid']); sys.exit()
" 2>/dev/null)
[ -z "$DEVICE" ] && { echo "❌ No booted Simulator"; exit 1; }

echo "🎬 Recording: $VIDEO"
echo "   Press Ctrl+C to stop early"
echo ""

# Record
xcrun simctl io "$DEVICE" recordVideo "$VIDEO" &
PID=$!
trap "kill -INT $PID 2>/dev/null; wait $PID 2>/dev/null; echo ''; echo '🎬 Saved: $VIDEO'; ls -lh '$VIDEO'" EXIT
sleep 1

# Run walkthrough
maestro test "$SCRIPT_DIR/full_walkthrough.yaml" 2>&1 || true

# Let recording capture final frame
sleep 2

# Stop recording (trap handles cleanup)
kill -INT $PID 2>/dev/null
wait $PID 2>/dev/null
trap - EXIT

echo ""
echo "✅ Done!"
ls -lh "$VIDEO"
