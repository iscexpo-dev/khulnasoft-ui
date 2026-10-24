#!/usr/bin/env sh

DOCS_PATH=packages/khulnasoft-ui/doc/contributing/visual_testing.md

if [ "$CI" != true ]; then
  echo "ERROR: This script should only be run in CI." >&2
  echo "To update screenshots locally, see $DOCS_PATH" >&2
  exit 1
fi

./bin/update_screenshots.mjs || exit 1

if [ -z "$(git status --porcelain -- tests/__image_snapshots__)" ]; then
  echo "Screenshots are up to date."
  exit 0
fi

if [ "$CI_PROJECT_PATH" != "$DESIGN_KHULNASOFT_COM_PROJECT_PATH" ]; then
  echo "This job cannot push to your branch from a pipeline in a fork."
  echo "To update the screenshots, run this from the repository root on your branch:"
  echo
  echo "  packages/khulnasoft-ui/bin/update_screenshots.mjs --pipeline $CI_PIPELINE_URL"
  echo
  echo "Then review and commit the changes. For details, see:"
  echo "$CI_SERVER_URL/$DESIGN_KHULNASOFT_COM_PROJECT_PATH/-/blob/main/$DOCS_PATH"
  exit 1
fi

echo "Setting commit author to KhulnaSoft Bot..."
git config --global user.email "khulnasoft-bot@khulnasoft.com"
git config --global user.name "KhulnaSoft Bot"

# Get back onto the source branch, since we might be on a merged result commit.
echo "Checkout out $CI_MERGE_REQUEST_SOURCE_BRANCH_NAME..."
git checkout "$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME"

echo "Creating chore commit..."
git add .
git commit -m 'Update test snapshots'

#
# Utilizing CI_MERGE_REQUEST_SOURCE_PROJECT_PATH in order to be able to push to forks
# See: https://docs.khulnasoft.com/ee/user/project/merge_requests/allow_collaboration.html
#
echo "Pushing to branch ${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME} on ${CI_MERGE_REQUEST_SOURCE_PROJECT_PATH}"

# The KHULNASOFT_TOKEN_MR token should:
# - have limited scope (`write_repository` only)
# - *not* be "protected" (https://docs.khulnasoft.com/ci/variables/#protect-a-cicd-variable)
# as it is needs to be available in merge request pipelines.
git push \
  "https://khulnasoft-bot:${KHULNASOFT_TOKEN_MR}@khulnasoft.com/${CI_MERGE_REQUEST_SOURCE_PROJECT_PATH}.git" \
  "HEAD:${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}" >/dev/null 2>&1
