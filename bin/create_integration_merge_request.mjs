#!/usr/bin/env node

// This script intentionally uses await in loops, so CiJobSections are
// correctly nested.
/* eslint-disable no-await-in-loop */

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { CiJobSection } from './lib/ci_job_section.mjs';

const {
  CI_COMMIT_REF_NAME,
  CI_MERGE_REQUEST_ASSIGNEES,
  CI_MERGE_REQUEST_IID,
  CI_MERGE_REQUEST_PROJECT_ID,
  CI_MERGE_REQUEST_PROJECT_URL,
  DEPENDENCY_URL,
  KHULNASOFT_CANONICAL_INTEGRATION_REST_TOKEN,
  DANGER_KHULNASOFT_API_TOKEN,
} = process.env;

const TRACKED_FILES = ['package.json', 'yarn.lock'];
const API_ROOT = 'https://khulnasoft.com/api/v4';
const KHULNASOFT_PROJECT_ID = '278964'; // khulnasoft-org/khulnasoft
const API_ENDPOINT_REPOSITORY_BRANCH = '/projects/:id/repository/branches/:branch';
const API_ENDPOINT_REPOSITORY_RAW_FILE = '/projects/:id/repository/files/:file_path';
const API_ENDPOINT_CREATE_COMMIT = '/projects/:id/repository/commits';
const API_ENDPOINT_MERGE_REQUESTS = '/projects/:id/merge_requests';
const API_ENDPOINT_MERGE_REQUEST = '/projects/:id/merge_requests/:merge_request_iid';
const API_ENDPOINT_USERS = '/users';
const INTEGRATION_BRANCH_NAME = `khulnasoft-ui-integration/${CI_COMMIT_REF_NAME}`;
const MERGE_REQUEST_LABELS = [
  'pipeline::tier-3',
  'pipeline:run-all-jest',
  'pipeline:run-all-rspec',
];

let tmpDir;
export function createTemporaryDirectory(prefix = 'khulnasoftUiIntegration-') {
  tmpDir = mkdtempSync(join(tmpdir(), prefix));
}

function buildApiUrl(endpoint, params = {}, searchParams = {}) {
  let apiPath = endpoint;

  Object.entries(params).forEach(([key, value]) => {
    apiPath = apiPath.replace(`:${key}`, encodeURIComponent(value));
  });

  const url = new URL(API_ROOT + apiPath);

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.href;
}

function prettyJson(value, { maxStringValueLength = 1000, indent = 2 } = {}) {
  const truncated = ' ... truncated';
  return JSON.stringify(
    value,
    (_, subValue) =>
      typeof subValue === 'string' && subValue.length > maxStringValueLength
        ? `${subValue.slice(0, maxStringValueLength - truncated.length)}${truncated}`
        : subValue,
    indent,
  );
}

async function api(
  endpoint,
  {
    payload = undefined,
    params = {},
    searchParams = {},
    method = 'GET',
    token = KHULNASOFT_CANONICAL_INTEGRATION_REST_TOKEN,
  },
) {
  const url = buildApiUrl(endpoint, { id: KHULNASOFT_PROJECT_ID, ...params }, searchParams);
  const section = new CiJobSection(`[api] ${method} ${url}`);

  try {
    const body = payload !== undefined ? JSON.stringify(payload) : payload;

    if (payload !== undefined) {
      console.log('[api] request body', prettyJson(payload));
    }

    const headers = {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
    };
    const response = await fetch(url, { method, body, headers });
    const data = await response.json();

    const result = { response, data };
    console.log(
      '[api] response',
      prettyJson({
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      }),
    );

    return result;
  } finally {
    section.end();
  }
}

async function remoteBranchExists() {
  const { response } = await api(API_ENDPOINT_REPOSITORY_BRANCH, {
    params: {
      branch: INTEGRATION_BRANCH_NAME,
    },
  });
  return response.ok;
}

export async function pullFileFromProject(file, branch) {
  console.log(`Fetching ${file} from the remote repository.`);

  const { data } = await api(API_ENDPOINT_REPOSITORY_RAW_FILE, {
    params: { file_path: file },
    searchParams: { ref: branch },
  });

  const localFilePath = join(tmpDir, file);
  console.log(`Writing output to ${localFilePath}.`);
  writeFileSync(localFilePath, Buffer.from(data.content, 'base64'), 'utf-8');
}

function installKhulnaSoftUIDevBuild() {
  const section = new CiJobSection(`Installing development build from ${DEPENDENCY_URL}.`);

  try {
    const { status, error } = spawnSync(
      'yarn',
      ['add', '--ignore-scripts', `@khulnasoft/ui@${DEPENDENCY_URL}`],
      {
        cwd: tmpDir,
        stdio: 'inherit',
      },
    );

    if (error) {
      throw error;
    }

    if (status !== 0) {
      throw new Error(`yarn failed with status=${status}`);
    }
  } finally {
    section.end();
  }
}

async function pushChanges({ createBranch = true }) {
  console.log('Pushing changes to the repository.');

  const { response, data } = await api(API_ENDPOINT_CREATE_COMMIT, {
    method: 'POST',
    payload: {
      ...(createBranch ? { start_branch: 'master' } : {}),
      branch: INTEGRATION_BRANCH_NAME,
      commit_message: `KhulnaSoft UI integration test for ${CI_COMMIT_REF_NAME}`,
      actions: TRACKED_FILES.map((file) => ({
        action: 'update',
        file_path: file,
        content: readFileSync(join(tmpDir, file), 'utf-8'),
      })),
    },
  });

  if (createBranch && response.status === 201) {
    console.log(`Integration branch created successfully.`);
    return;
  }

  if (!createBranch && response.status === 201) {
    console.log(`Integration branch updated successfully.`);
    return;
  }

  if (!createBranch && response.status === 400) {
    console.warn(`The integration branch is already up-to-date.`);
    return;
  }

  console.error(`Could not push the changes. See below for more information about the failure.`);
  console.error({ response, data });
}

export async function getUserIds(usernames) {
  const ids = [];

  for (const username of usernames) {
    const { response, data } = await api(API_ENDPOINT_USERS, { searchParams: { username } });

    if (response.ok && data?.length > 0) {
      ids.push(data[0].id);
    } else {
      console.warn(`Failed to get id of user "${username}", skipping...`);
    }
  }

  return ids;
}

export async function createMergeRequest() {
  const khulnasoftUiMergeRequestProjectUrl = `${CI_MERGE_REQUEST_PROJECT_URL}/-/merge_requests/${CI_MERGE_REQUEST_IID}`;
  const { response, data } = await api(API_ENDPOINT_MERGE_REQUESTS, {
    method: 'POST',
    payload: {
      source_branch: INTEGRATION_BRANCH_NAME,
      target_branch: 'master',
      labels: MERGE_REQUEST_LABELS.join(','),
      assignee_ids: await getUserIds(CI_MERGE_REQUEST_ASSIGNEES?.split(',').filter(Boolean) ?? []),
      title: `Draft: KhulnaSoft integration test for ${khulnasoftUiMergeRequestProjectUrl}`,
      description: `Integration test merge request for ${khulnasoftUiMergeRequestProjectUrl}.

## Do not merge this!

### Workflow

1. Fix pipeline failures in this merge request, if any are needed.
2. When ready, get ${khulnasoftUiMergeRequestProjectUrl} merged.
3. Close *this* merge request.
4. Wait for [Renovate](https://docs.khulnasoft.com/development/dependencies/) to
   create a version bump merge request for \`@khulnasoft/ui\`. You will
   automatically be pinged on that merge request and assigned to it.
5. If you made any fixes in this merge request,
   [cherry-pick](https://docs.khulnasoft.com/user/project/merge_requests/cherry_pick_changes/)
   them into Renovate's merge request.
6. Get that Renovate merge request
   [reviewed](https://docs.khulnasoft.com/development/code_review/) and merged.

### Checks

- [ ] The full Jest suite has run (i.e., not just predictive jobs)
- [ ] The full Jest suite has passed
- [ ] The full RSpec suite has run (i.e., not just predictive jobs)
- [ ] The full RSpec suite has passed

### After ${khulnasoftUiMergeRequestProjectUrl} merges

- [ ] Close this merge request.
- [ ] Cherry-pick fixes from here to Renovate's merge request.`,
    },
  });

  if (!response.ok) {
    console.warn(`Failed to create a merge request: ${response.statusText}:`);
    console.warn(prettyJson(data));
    return undefined;
  }

  console.log(`Merge request created: ${data.web_url}`);
  return data.web_url;
}

async function updateOriginatingMrDescription(integrationMrUrl) {
  const section = new CiJobSection('Updating originating MR description');

  try {
    const { response, data } = await api(API_ENDPOINT_MERGE_REQUEST, {
      params: { id: CI_MERGE_REQUEST_PROJECT_ID, merge_request_iid: CI_MERGE_REQUEST_IID },
      token: DANGER_KHULNASOFT_API_TOKEN,
    });

    if (!response.ok) {
      console.error(`Failed to fetch originating MR description: ${response.statusText}`);
      return;
    }

    const taskItemRegexp = /^- \[ \].*KhulnaSoft.*mr_url.*ui:create_integration_merge_request.*$/im;

    if (!taskItemRegexp.test(data.description)) {
      console.log(`Task item not found in originating MR description; skipping update.`);
      return;
    }

    const updatedDescription = data.description.replace(
      taskItemRegexp,
      `- [x] **[KhulnaSoft](https://khulnasoft.com/khulnasoft-org/khulnasoft)**: ${integrationMrUrl}+`,
    );

    const { response: updateResponse, data: updateData } = await api(API_ENDPOINT_MERGE_REQUEST, {
      method: 'PUT',
      params: { id: CI_MERGE_REQUEST_PROJECT_ID, merge_request_iid: CI_MERGE_REQUEST_IID },
      payload: { description: updatedDescription },
      token: DANGER_KHULNASOFT_API_TOKEN,
    });

    if (!updateResponse.ok) {
      console.error(`Failed to update originating MR description: ${updateResponse.statusText}`);
      console.error(prettyJson(updateData));
    }
  } catch (error) {
    console.error('Failed to update originating MR description:');
    console.error(error);
  } finally {
    section.end();
  }
}

async function findExistingMergeRequests() {
  const { response, data } = await api(API_ENDPOINT_MERGE_REQUESTS, {
    searchParams: { state: 'opened', source_branch: INTEGRATION_BRANCH_NAME },
  });

  if (!response.ok) {
    console.warn(`Failed to find existing merge requests: ${response.statusText}:`);
    console.warn(prettyJson(data));
    return undefined;
  }

  return data.map(({ web_url: webUrl }) => webUrl);
}

async function main() {
  try {
    const branchExists = await remoteBranchExists();

    if (branchExists) {
      console.log(
        `The branch \`${INTEGRATION_BRANCH_NAME}\` exists on the remote so we will update it.`,
      );
    } else {
      console.log(`A new branch \`${INTEGRATION_BRANCH_NAME}\` will be created on the remote.`);
    }

    const sourceBranch = branchExists ? INTEGRATION_BRANCH_NAME : 'master';

    createTemporaryDirectory();

    for (const file of TRACKED_FILES) {
      await pullFileFromProject(file, sourceBranch);
    }

    installKhulnaSoftUIDevBuild();
    await pushChanges({ createBranch: !branchExists });

    const mergeRequests = await findExistingMergeRequests();

    if (mergeRequests === undefined) {
      // There was an error in finding existing merge requests; do nothing.
      return;
    }

    if (mergeRequests.length === 0) {
      console.log(
        `No existing merge requests found for ${INTEGRATION_BRANCH_NAME}; creating a new merge request...`,
      );
      const integrationMrUrl = await createMergeRequest();
      if (integrationMrUrl) {
        await updateOriginatingMrDescription(integrationMrUrl);
      }
      return;
    }

    if (mergeRequests.length === 1) {
      console.log(`Existing merge request updated: ${mergeRequests[0]}`);
      return;
    }

    console.warn(`There are multiple open merge requests for ${INTEGRATION_BRANCH_NAME}:`);
    console.warn(mergeRequests.map((webUrl, i) => ` ${i + 1}. ${webUrl}`).join('\n'));
  } catch (error) {
    console.error('Something went wrong! See above for details.');
    console.error(error);
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  await main();
}
