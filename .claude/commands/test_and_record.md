Run the full TennisMeetup automated test suite with screen recording.

Steps:
1. Verify iOS Simulator is running with Expo app
2. Execute: `export PATH="$PATH:$HOME/.maestro/bin" && ./maestro/test_and_record.sh`
3. Report results: which flows passed/failed
4. List the .mp4 recording files created

If Simulator is not running, help the user start it:
- `open -a Simulator`
- Then start Expo: `cd /Users/yuekunyang/TennisMeetupRN && /usr/local/bin/claude_code/node ./node_modules/.bin/expo start`
- Press `i` in Metro terminal to install on Simulator
