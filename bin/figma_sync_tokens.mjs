#!/usr/bin/env node

import fs from 'node:fs';
import { join } from 'node:path';
import { FigmaClient } from './lib/figma/figma_sync_tokens_client.mjs';
import { syncConstants, syncMode } from './lib/figma/figma_sync_tokens_collections.mjs';

const FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN = process.env.FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN || '';
const FIGMA_DESIGN_TOKEN_FILE_ID = process.env.FIGMA_DESIGN_TOKEN_FILE_ID || '';

const ERROR_MESSAGE_ENVIRONMENT_VARIABLES = `Error: FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN and FIGMA_DESIGN_TOKEN_FILE_ID environment variables are required

Setup instructions:
1. Go to https://www.figma.com/settings/tokens
2. Create a new personal access token with these scopes:
   - file_content:read
   - file_variables:read
   - file_variables:write
3. Set environment variables:
   export FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN="***************"
   export FIGMA_DESIGN_TOKEN_FILE_ID="your_file_id_here"

File ID can be found in the Figma URL: figma.com/file/{FILE_ID}`;

const successMessage = (constantsResult, modeResult) => `
═══════════════════════════════════════
✓ Token sync completed successfully
═══════════════════════════════════════
Constants: ${constantsResult.variablesCreated} created, ${constantsResult.variablesUpdated} updated
Mode:      ${modeResult.variablesCreated} created, ${modeResult.variablesUpdated} updated
Total:     ${constantsResult.variablesCreated + modeResult.variablesCreated} created, ${constantsResult.variablesUpdated + modeResult.variablesUpdated} updated
═══════════════════════════════════════`;

async function main() {
  if (!FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN || !FIGMA_DESIGN_TOKEN_FILE_ID) {
    console.error(ERROR_MESSAGE_ENVIRONMENT_VARIABLES);
    process.exit(1);
  }

  const client = new FigmaClient(FIGMA_DESIGN_TOKEN_SYNC_ACCESS_TOKEN, FIGMA_DESIGN_TOKEN_FILE_ID);

  try {
    // Fetch existing variables
    await client.fetchVariables();

    // Load tokens
    const ROOT = join(import.meta.dirname, '..');
    const tokensDir = join(ROOT, 'src', 'tokens', 'build', 'figma');

    const constants = JSON.parse(fs.readFileSync(join(tokensDir, 'constants.json'), 'utf-8'));
    const mode = JSON.parse(fs.readFileSync(join(tokensDir, 'mode.json'), 'utf-8'));
    const modeDark = JSON.parse(fs.readFileSync(join(tokensDir, 'mode.dark.json'), 'utf-8'));

    const flatConstants = new Map(Object.entries(constants));
    const flatMode = new Map(Object.entries(mode));
    const flatModeDark = new Map(Object.entries(modeDark));

    // Sync collections
    const constantsResult = await syncConstants(client, flatConstants);
    const modeResult = await syncMode(client, flatMode, flatModeDark);

    console.log(successMessage(constantsResult, modeResult));
  } catch (error) {
    console.error('✗ Token sync failed:', error.message);
    process.exit(1);
  }
}

main();
