#!/usr/bin/env node

/* eslint-disable no-await-in-loop */

// Note: This script has no dependencies except node built-ins.
// If we can, we should keep it so, then we don't need to yarn install
import path from 'node:path';
import os from 'node:os';
import { env } from 'node:process';
import { parseArgs, promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { rm, copyFile, readFile, readdir, mkdtemp } from 'node:fs/promises';

const COLLECTOR_JOB_NAME = 'ui:screenshot_collector';
const ROOT_DIR = path.join(import.meta.dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT_DIR, 'tests/__image_snapshots__');
// The visual tests use this as the baseline for new stories
const TEMPLATE_SCREENSHOT = path.join(ROOT_DIR, 'tests/template.png');

const run = promisify(execFile);

// Errors with a message that is enough to act on, so they are reported without a stack trace
class ScriptError extends Error {}

async function checkUnzipIsInstalled() {
  try {
    await run('unzip', ['-v']);
  } catch (e) {
    if (e.code === 'ENOENT') {
      throw new ScriptError('unzip is required. Install it, then try again.');
    }
    throw e;
  }
}

async function fetchFromApi(url) {
  const headers = env.KHULNASOFT_TOKEN ? { 'PRIVATE-TOKEN': env.KHULNASOFT_TOKEN } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new ScriptError(`Request to ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function findCollectorJob(pipelineUrl) {
  const url = URL.parse(pipelineUrl);
  const [, projectPath, pipelineId] = url?.pathname.match(/^\/(.+?)\/-\/pipelines\/(\d+)/) ?? [];
  if (!projectPath) {
    throw new ScriptError(`${pipelineUrl} does not look like a pipeline URL`);
  }

  const projectApi = `${url.origin}/api/v4/projects/${encodeURIComponent(projectPath)}`;
  let page = '1';
  while (page) {
    const response = await fetchFromApi(
      `${projectApi}/pipelines/${pipelineId}/jobs?per_page=100&page=${page}`,
    );
    const job = (await response.json()).find(({ name }) => name === COLLECTOR_JOB_NAME);
    if (job) {
      return { ...job, artifactsUrl: `${projectApi}/jobs/${job.id}/artifacts` };
    }
    page = response.headers.get('x-next-page');
  }

  throw new ScriptError(`Could not find a ${COLLECTOR_JOB_NAME} job in ${pipelineUrl}`);
}

async function downloadScreenshots(pipelineUrl, tmpDir) {
  const job = await findCollectorJob(pipelineUrl);
  if (job.status !== 'success') {
    throw new ScriptError(
      `${COLLECTOR_JOB_NAME} job is "${job.status}". Wait for it to succeed, then try again: ${job.web_url}`,
    );
  }

  console.warn(`Downloading artifacts of ${job.web_url}`);
  const zipFile = path.join(tmpDir, 'artifacts.zip');
  const response = await fetchFromApi(job.artifactsUrl);
  await pipeline(Readable.fromWeb(response.body), createWriteStream(zipFile));
  await run('unzip', ['-q', zipFile, '-d', tmpDir]);

  // Matches the artifact paths of the collector job, which are relative to the repository root
  return path.join(tmpDir, 'packages/khulnasoft-ui/tests/__image_snapshots__');
}

async function listFiles(dirname, pattern = /./) {
  const entries = await readdir(dirname, { withFileTypes: true });

  return entries.flatMap((entry) => {
    return entry.isFile() && pattern.test(entry.name) ? path.join(dirname, entry.name) : [];
  });
}

async function loadUsedScreenshots(sourceDir) {
  const paths = await listFiles(sourceDir, /^__used_screenshots_/);
  const allFiles = Promise.all(
    paths.map(async (file) => {
      const content = (await readFile(file, 'utf-8'))
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => path.join(ROOT_DIR, line));

      console.warn(`Read ${path.basename(file)}, found ${content.length} used screenshots`);

      return content;
    }),
  );
  return (await allFiles).flat();
}

async function copyUpdatedScreenshots(sourceDir) {
  const updatedScreenshotDir = path.join(sourceDir, '__updated_screenshots__');
  console.warn(`Checking for updated screenshots in ${updatedScreenshotDir}`);

  let updatedScreenshots;
  try {
    updatedScreenshots = await listFiles(updatedScreenshotDir, /\.png$/);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    console.warn(`${updatedScreenshotDir} doesn't exist, so likely no screenshots needed updating`);
    return { added: 0, updated: 0 };
  }

  const template = await readFile(TEMPLATE_SCREENSHOT);
  const counts = { added: 0, updated: 0 };
  for (const screenshot of updatedScreenshots) {
    const targetName = path.basename(screenshot).replace(/-received\.png$/, '.png');
    const target = path.join(SCREENSHOT_DIR, targetName);
    const existing = await readFile(target).catch((e) => {
      if (e.code !== 'ENOENT') throw e;
      return null;
    });
    const isNew = !existing || existing.equals(template);

    console.warn(
      `Screenshot ${targetName} seems to be ${isNew ? 'new' : 'updated'}. Copying file...`,
    );
    await copyFile(screenshot, target);
    counts[isNew ? 'added' : 'updated'] += 1;
  }
  return counts;
}

async function removeUnusedScreenshots(sourceDir) {
  const usedScreenshots = await loadUsedScreenshots(sourceDir);
  if (!usedScreenshots.length) {
    console.warn(`No usage reports found, skipping deletion of screenshots.`);
    return 0;
  }

  console.warn(
    `The visual specs used ${usedScreenshots.length} screenshots. Checking whether we have unused ones...`,
  );
  let removed = 0;
  for (const screenshot of await listFiles(SCREENSHOT_DIR, /\.png$/)) {
    if (!usedScreenshots.includes(screenshot)) {
      console.warn(`Screenshot ${path.basename(screenshot)} seems unused. Removing...`);
      await rm(screenshot);
      removed += 1;
    }
  }
  return removed;
}

async function updateScreenshots(sourceDir) {
  const { added, updated } = await copyUpdatedScreenshots(sourceDir);
  const removed = await removeUnusedScreenshots(sourceDir);
  console.warn(`Screenshots added: ${added}, updated: ${updated}, removed: ${removed}`);
}

async function main() {
  const { values: args } = parseArgs({ options: { pipeline: { type: 'string' } } });

  if (args.pipeline) {
    await checkUnzipIsInstalled();
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), 'gl-screenshots-'));
    try {
      await updateScreenshots(await downloadScreenshots(args.pipeline, tmpDir));
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  } else if (env.CI_MERGE_REQUEST_SOURCE_PROJECT_PATH) {
    // In CI, the collector job's artifacts are already in place
    await updateScreenshots(SCREENSHOT_DIR);
  } else {
    throw new ScriptError(
      [
        'CI_MERGE_REQUEST_SOURCE_PROJECT_PATH is not set',
        'This is normally run in CI. To run it locally, pass the URL of a pipeline whose screenshots you want:',
        '  bin/update_screenshots.mjs --pipeline <pipeline url>',
        'See doc/contributing/visual_testing.md for the full local workflow.',
      ].join('\n'),
    );
  }
}

try {
  await main();
} catch (e) {
  if (!(e instanceof ScriptError)) throw e;
  console.error(`ERROR: ${e.message}`);
  process.exitCode = 1;
}
