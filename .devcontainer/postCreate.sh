#!/bin/sh
set -e

echo "▶ Installing npm dependencies (light mode)…"
npm ci --ignore-scripts --prefer-offline || npm install --ignore-scripts

echo "▶ Dev Container ready."