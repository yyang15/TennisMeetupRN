#!/bin/bash
# TennisMeetup — Record full app walkthrough
# Delegates to record.js for proper subprocess management
exec /usr/local/bin/claude_code/node "$(dirname "$0")/record.js" "$@"
