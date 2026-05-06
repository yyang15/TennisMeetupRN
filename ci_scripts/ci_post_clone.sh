#!/bin/zsh

set -e

echo "--- Installing Node.js ---"
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

echo "--- Installing dependencies ---"
npm install

echo "--- Generating iOS native project ---"
npx expo prebuild --platform ios --non-interactive
