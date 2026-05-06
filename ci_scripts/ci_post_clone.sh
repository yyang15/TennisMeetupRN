#!/bin/zsh

set -e

echo "--- Installing Node.js ---"
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"

echo "--- Installing npm dependencies ---"
npm install

echo "--- Installing CocoaPods dependencies ---"
cd ios && pod install
