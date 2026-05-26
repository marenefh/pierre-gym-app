#!/bin/bash
export PATH="$HOME/node-install/node-v22.14.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")"
exec npm run dev -- --port 5173
