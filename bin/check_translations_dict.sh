#!/bin/bash

yarn translations:collect
git diff --exit-code ./translations.js
if [ $? -ne 0 ]; then
  echo "Translatable labels dictionary is outdated. Please run \`yarn translations:collect\` and commit the changes"
  exit 1
else
  echo "Translatable labels dictionary is up-to-date."
  exit 0
fi
