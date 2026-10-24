#!/usr/bin/env sh

yarn build-tokens

echo "Setting commit author to KhulnaSoft Bot..."
git config --global user.email "khulnasoft-bot@khulnasoft.com"
git config --global user.name "KhulnaSoft Bot"

# Get back onto the source branch, since we might be on a merged result commit.
echo "Checking out $CI_MERGE_REQUEST_SOURCE_BRANCH_NAME..."
git checkout "$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME"

echo "Staging token build output..."
git add src/tokens/build

if git diff --cached --quiet; then
  echo "No token changes to commit."
  exit 0
fi

echo "Creating commit..."
git commit -m 'Update tokens build'

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
