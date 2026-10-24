#!/usr/bin/env node

import { parseArgs } from 'node:util';

const DEFAULT_REF = 'main';
const DEFAULT_TIMEOUT = 30 * 60; // 30 minutes
const DEFAULT_POLL_INTERVAL = 30; // 30 seconds

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function parseArguments() {
  const { values } = parseArgs({
    options: {
      'project-id': {
        type: 'string',
      },
      variable: {
        type: 'string',
        multiple: true,
        default: [],
      },
      ref: {
        type: 'string',
        default: DEFAULT_REF,
      },
      token: {
        type: 'string',
      },
      timeout: {
        type: 'string',
        default: String(DEFAULT_TIMEOUT),
      },
      'poll-interval': {
        type: 'string',
        default: String(DEFAULT_POLL_INTERVAL),
      },
    },
    strict: true,
  });

  const messages = [];

  // Validate required options
  if (!values['project-id']) {
    messages.push('Missing required option: --project-id');
  }

  if (!values.token) {
    messages.push('Missing required option: --token');
  }

  const timeout = Number(values.timeout);
  if (!Number.isFinite(timeout) || timeout <= 0) {
    messages.push('Timeout must be a number > 0');
  }

  const pollInterval = Number(values['poll-interval']);
  if (!Number.isFinite(pollInterval) || pollInterval <= 0) {
    messages.push('Poll interval must be a number > 0');
  }

  // Parse variables into key-value pairs
  const variables = {};
  for (const variable of values.variable) {
    const colonIndex = variable.indexOf(':');
    if (colonIndex === -1) {
      messages.push(`Invalid variable format: ${variable}. Expected format: name:value`);
      continue;
    }
    const name = variable.slice(0, colonIndex);
    const value = variable.slice(colonIndex + 1);
    variables[name] = value;
  }

  const baseUrl = process.env.CI_API_V4_URL;
  if (!baseUrl) {
    messages.push(`CI_API_V4_URL environment variable is empty`);
  }

  if (messages.length > 0) {
    for (const message of messages) {
      log(message);
    }
    throw new Error('Invalid arguments. See above for details.');
  }

  return {
    projectId: values['project-id'],
    token: values.token,
    ref: values.ref,
    variables,
    timeout: 1000 * timeout,
    pollInterval: 1000 * pollInterval,
    baseUrl,
  };
}

async function triggerPipeline({ projectId, token, ref, variables, baseUrl }) {
  log(`Triggering pipeline on project ${projectId} (ref: ${ref})...`);

  const formData = new FormData();
  formData.append('token', token);
  formData.append('ref', ref);

  for (const [name, value] of Object.entries(variables)) {
    formData.append(`variables[${name}]`, value);
  }

  try {
    const response = await fetch(`${baseUrl}/projects/${projectId}/trigger/pipeline`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create pipeline: ${response.status} ${response.statusText}`);
    }

    const pipelineData = await response.json();

    if (pipelineData.id) {
      log(
        `Pipeline triggered successfully. Pipeline ID: ${pipelineData.id}, web_url: ${pipelineData.web_url}`,
      );
      return pipelineData.id;
    }
    throw new Error(`Failed to trigger pipeline: ${JSON.stringify(pipelineData)}`);
  } catch (error) {
    log(`Error triggering pipeline: ${error.message}`);
    return null;
  }
}

async function getPipelineStatus({ projectId, pipelineId, baseUrl }) {
  try {
    const response = await fetch(`${baseUrl}/projects/${projectId}/pipelines/${pipelineId}`);

    if (!response.ok) {
      throw new Error(`Failed to get pipeline status: ${response.status} ${response.statusText}`);
    }

    const pipelineData = await response.json();
    return pipelineData.status;
  } catch (error) {
    log(`Error getting pipeline status: ${error.message}`);
    return null;
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function pollPipelineStatus(config) {
  if (Date.now() - config.startTime > config.timeout) {
    log(`Pipeline polling timed out after ${config.timeout / 1000} seconds`);
    return false;
  }

  const status = await getPipelineStatus(config);

  if (status === null) {
    log('Failed to get pipeline status, retrying...');
  } else {
    log(`Pipeline status: ${status}`);

    if (status === 'success') {
      log('Pipeline completed successfully!');
      return true;
    }
    if (['failed', 'canceled', 'skipped'].includes(status)) {
      log(`Pipeline failed with status: ${status}`);
      return false;
    }
    if (!['pending', 'running', 'created'].includes(status)) {
      log(`Unknown pipeline status: ${status}`);
      return false;
    }
  }

  await sleep(config.pollInterval);
  return pollPipelineStatus(config);
}

async function waitForPipelineCompletion(config) {
  log(`Waiting for pipeline ${config.pipelineId} to complete...`);
  return pollPipelineStatus({ ...config, startTime: Date.now() });
}

async function main() {
  try {
    const config = parseArguments();
    const pipelineId = await triggerPipeline(config);

    if (pipelineId === null) {
      process.exitCode = 1;
      return;
    }

    process.exitCode = (await waitForPipelineCompletion({ ...config, pipelineId })) ? 0 : 1;
  } catch (error) {
    log(error.message);
    process.exitCode = 1;
  }
}

main();
