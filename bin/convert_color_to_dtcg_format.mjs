#!/usr/bin/env node

import fs from 'node:fs';
import { globSync } from 'glob';

/**
 * Converts a hex color string to normalized sRGB components (0-1 range)
 *
 * @param {string} hex - Hex color string (e.g., "#E32828" or "#fff")
 * @returns {number[]} Array of three normalized sRGB components [r, g, b]
 */
function hexToSrgbComponents(hex) {
  // Remove # if present
  let cleanHex = hex.replace(/^#/, '');

  // Expand 3-digit hex to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Extract RGB components
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

/**
 * Parses rgba() or rgb() CSS color string to normalized sRGB components and alpha
 *
 * @param {string} rgbaString - CSS rgba() or rgb() string (e.g., "rgba(164, 163, 168, 0.16)")
 * @returns {Object} Object with components array and alpha value
 */
function parseRgbaString(rgbaString) {
  // Match rgba(r, g, b, a) or rgb(r, g, b) format
  const match = rgbaString.match(
    /rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d+(?:\.\d+)?))?\s*\)/,
  );

  if (!match) {
    throw new Error(`Invalid rgba/rgb format: ${rgbaString}`);
  }

  const r = parseFloat(match[1]) / 255;
  const g = parseFloat(match[2]) / 255;
  const b = parseFloat(match[3]) / 255;
  const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;

  return {
    components: [r, g, b],
    alpha,
  };
}

/**
 * Checks if a string is a hex color value (not a token reference)
 *
 * @param {string} value - The value to check
 * @returns {boolean} True if the value is a hex color
 */
function isHexColor(value) {
  if (typeof value !== 'string') {
    return false;
  }
  // Check if it's a hex color (starts with # and contains only hex digits)
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
}

/**
 * Checks if a string is an rgba/rgb color value
 *
 * @param {string} value - The value to check
 * @returns {boolean} True if the value is an rgba/rgb color
 */
function isRgbaColor(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return /^rgba?\(/.test(value);
}

/**
 * Converts a hex color string to DTCG color format
 *
 * @param {string} hex - Hex color string
 * @returns {Object} DTCG color object with colorSpace, components, alpha, and hex
 */
function hexToDtcgColor(hex) {
  const components = hexToSrgbComponents(hex);

  return {
    colorSpace: 'srgb',
    components,
    alpha: 1,
    hex,
  };
}

/**
 * Converts an rgba/rgb color string to DTCG color format
 *
 * @param {string} rgbaString - CSS rgba/rgb color string
 * @returns {Object} DTCG color object with colorSpace, components, and alpha
 */
function rgbaToDtcgColor(rgbaString) {
  const { components, alpha } = parseRgbaString(rgbaString);

  return {
    colorSpace: 'srgb',
    components,
    alpha,
  };
}

/**
 * Converts a color value to DTCG format based on its type
 *
 * @param {string} value - The color value to convert
 * @returns {Object|string} DTCG color object or original value if not a color
 */
function convertColorValue(value) {
  if (typeof value === 'string') {
    if (isHexColor(value)) {
      return hexToDtcgColor(value);
    }

    if (isRgbaColor(value)) {
      return rgbaToDtcgColor(value);
    }
  }
  return value;
}

/**
 * Processes a single color token, converting it to DTCG format
 *
 * @param {Object} token - The token object to process
 * @returns {Object} The processed token
 */
function processColorToken(token) {
  if (token.$type !== 'color') {
    return token;
  }

  const value = token.$value;

  // Handle mode-based tokens with {default, dark} structure
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'default' in value &&
    'dark' in value
  ) {
    return {
      ...token,
      $value: {
        default: convertColorValue(value.default),
        dark: convertColorValue(value.dark),
      },
    };
  }

  // Handle simple color string values
  if (typeof value === 'string' && (isHexColor(value) || isRgbaColor(value))) {
    return {
      ...token,
      $value: convertColorValue(value),
    };
  }

  // If it's already in DTCG format or some other format, return as-is
  return token;
}

/**
 * Recursively processes all tokens in an object
 *
 * @param {Object} obj - The object to process
 * @returns {Object} The processed object
 */
function processTokensRecursive(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  // If this is a token (has $type and $value), handle it based on type
  if ('$type' in obj && '$value' in obj) {
    // Only process if it's a color token, otherwise return unchanged
    if (obj.$type === 'color') {
      return processColorToken(obj);
    }

    // For all other token types (dimension, typography, etc.), return as-is
    return obj;
  }

  // Only recursively process objects that are NOT tokens themselves
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, processTokensRecursive(value)]),
  );
}

/**
 * Processes a token file, converting all color tokens to DTCG format
 *
 * @param {string} filePath - Path to the token file
 */
function processTokenFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const tokens = JSON.parse(content);

    const processedTokens = processTokensRecursive(tokens);

    // Check if actual content changed, not just formatting
    const originalStringified = JSON.stringify(tokens, null, 2);
    const processedStringified = JSON.stringify(processedTokens, null, 2);

    if (originalStringified !== processedStringified) {
      const newContent = `${processedStringified}\n`;
      fs.writeFileSync(filePath, newContent);
      console.log(`✓ Modified: ${filePath}`);
    } else {
      console.log(`- Unchanged: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Finds all token files in the source directory
 *
 * @returns {string[]} Array of file paths
 */
function findAllTokenFiles() {
  return globSync('src/tokens/**/*.tokens.json').sort();
}

/**
 * Main execution
 */
async function main() {
  try {
    const tokenFiles = findAllTokenFiles();

    if (tokenFiles.length === 0) {
      console.log('No token files found');
      process.exit(0);
    }

    console.log(`Found ${tokenFiles.length} token files\n`);

    tokenFiles.forEach((filePath) => {
      processTokenFile(filePath);
    });

    console.log(`\n✓ Successfully converted ${tokenFiles.length} token files to DTCG format`);
  } catch (error) {
    console.error('\n✗ Conversion failed:', error.message);
    process.exit(1);
  }
}

main();
