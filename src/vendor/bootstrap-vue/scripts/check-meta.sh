#!/usr/bin/env bash
set -e

echo 'Checking plugin metadata...'
node ./scripts/check-plugin-meta.mjs || exit 1
echo 'Done.'
echo ''
