#!/usr/bin/env node
/**
 * Theme ramp generator. Prints six SCSS blocks to stdout: one `:root { … }`
 * block holding the default neutral ramp (paste into
 * `src/tokens/constant/color.neutral.tokens.json` and re-run
 * `make tokens`) and
 * one `:root.ui-<theme> { … }` block per tinted theme (paste into
 * `src/scss/themes.scss`). See `doc/contributing/theme_ramps.md`.
 */

import { formatScss, generateAllThemes } from './lib/theme_ramps.mjs';

process.stdout.write(formatScss(generateAllThemes()));
