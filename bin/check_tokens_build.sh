#!/bin/bash

yarn build-tokens
if [ -n "$(git status --porcelain=v2 ./src/tokens/build)" ]; then
  git status ./src/tokens/build
  echo "Tokens build is outdated. See above for the details. To fix this, run \`yarn build-tokens\` and commit the changes."
  exit 1
else
  echo "Tokens build is up-to-date."
  exit 0
fi
