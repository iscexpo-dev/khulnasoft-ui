#!/usr/bin/env sh

if [ "$CI" = true ]; then
  echo "Running in CI"

  args="${1}"
  json="--json --outputFile tests/results.json"

  if [ -n "$CI_NODE_INDEX" ]; then
    args="${args} --shard $CI_NODE_INDEX/$CI_NODE_TOTAL"
  fi

  if ! yarn test:visual:internal "${args} ${json}"; then
    echo "Some tests failed. Due to flakyness we are retrying them..."
    # Move first screenshot results, because if we have true failures
    # we will have them again. If we were not to move them, the results
    # might be confusing
    if [ -d tests/__image_snapshots__/__diff_output__ ]; then
      mv tests/__image_snapshots__/__diff_output__ tests/__image_snapshots__/__diff_output_before_retry__
    fi
    if [ -d tests/__image_snapshots__/__updated_screenshots__ ]; then
      mv tests/__image_snapshots__/__updated_screenshots__ tests/__image_snapshots__/__updated_screenshots_before_retry__
    fi
    yarn test:visual:internal "${args}"
  fi
else
  echo "Visual regression tests can only be run in CI at the moment."
  exit 1
fi
