#!/usr/bin/env node

import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import prettier from 'prettier';
const { format, resolveConfig } = prettier;

import StyleDictionary from 'style-dictionary';
import { merge } from 'lodash-es';
import { LIGHT_SELECTOR, DARK_SELECTOR } from '../src/tokens/color_mode.js';
import {
  scssCustomPropertiesFormat,
  tailwindComponentsFormat,
  tailwindDocsFormat,
  tailwindFormat,
  figmaFormat,
} from './lib/build_tokens_formats.js';
import {
  stripDescriptionsPreprocessor,
  resolveUnitsPreprocessor,
  selectDefaultValuePreprocessor,
  selectDarkValuePreprocessor,
  selectColorValuePreprocessor,
  convertClampStringToDimension,
} from './lib/build_tokens_preprocessors.js';

/**
 * Design tokens
 * https://docs.khulnasoft.com/ee/development/fe_guide/design_tokens.html
 */
const PREFIX = 'gl';
const ROOT = join(import.meta.dirname, '..');
const BUILD_PATH = join(ROOT, 'src', 'tokens', 'build');
// https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables#h_01KAGZ9T9H4P7RXY11SG4QXFY2
const FIGMA_SUPPORTED_TYPES = [
  'color',
  'dimension',
  'fontWeight',
  'fontFamily',
  'duration',
  'number',
  'string',
];

/**
 * Preprocessors
 * https://styledictionary.com/reference/hooks/preprocessors/
 */
StyleDictionary.registerPreprocessor({
  // Descriptions are added as comments in some formats, remove those comments
  name: 'khulnasoft/stripDescriptions',
  preprocessor: stripDescriptionsPreprocessor,
});

StyleDictionary.registerPreprocessor({
  name: 'khulnasoft/resolve-units',
  preprocessor: resolveUnitsPreprocessor,
});

StyleDictionary.registerPreprocessor({
  name: 'khulnasoft/select-default-value',
  preprocessor: selectDefaultValuePreprocessor,
});

StyleDictionary.registerPreprocessor({
  name: 'khulnasoft/select-dark-value',
  preprocessor: selectDarkValuePreprocessor,
});

StyleDictionary.registerPreprocessor({
  name: 'khulnasoft/select-color-value',
  preprocessor: selectColorValuePreprocessor,
});

StyleDictionary.registerPreprocessor({
  name: 'khulnasoft/convert-clamp-string-to-dimension',
  preprocessor: convertClampStringToDimension,
});

/**
 * Transforms
 * https://styledictionary.com/reference/api/#registertransform
 */
StyleDictionary.registerTransform({
  name: 'khulnasoft/name/stripPrefix',
  type: 'name',
  filter: (token) => {
    // Prefix is added by `name/*` transform.
    // If token has `prefix` explicitly set to `false` then we remove the prefix.
    return token.prefix === false;
  },
  transform: (token) => {
    return token.name.slice(PREFIX.length + 1);
  },
});

/**
 * Transform Groups
 * https://styledictionary.com/reference/api/#registertransformgroup
 */
StyleDictionary.registerTransformGroup({
  name: 'khulnasoft/css',
  transforms: ['name/kebab', 'khulnasoft/name/stripPrefix', 'shadow/css/shorthand'],
});

StyleDictionary.registerTransformGroup({
  name: 'khulnasoft/js',
  transforms: ['name/constant', 'khulnasoft/name/stripPrefix'],
});

StyleDictionary.registerTransformGroup({
  name: 'khulnasoft/tailwind',
  transforms: ['name/kebab'],
});

StyleDictionary.registerTransformGroup({
  name: 'khulnasoft/figma',
  transforms: ['name/kebab'],
});

/**
 * Formats
 * https://styledictionary.com/reference/api/#registerformat
 */
StyleDictionary.registerFormat({
  name: 'scss/customProperties',
  format: scssCustomPropertiesFormat,
});

StyleDictionary.registerFormat({
  name: 'tailwind/components',
  format: tailwindComponentsFormat,
});

StyleDictionary.registerFormat({
  name: 'docs',
  format: tailwindDocsFormat,
});

StyleDictionary.registerFormat({
  name: 'tailwind',
  format: tailwindFormat,
});

StyleDictionary.registerFormat({
  name: 'figma',
  format: figmaFormat,
});

/**
 * Actions
 * https://styledictionary.com/reference/api/#registeraction
 */
StyleDictionary.registerAction({
  name: 'prettier',
  async do(dictionary, config) {
    await Promise.all(
      config.files.map(async (file) => {
        const filePath = `${config.buildPath}${file.destination}`;
        const [fileContent, options] = await Promise.all([
          readFile(filePath, 'utf8'),
          resolveConfig(filePath),
        ]);
        const formattedOutput = await format(fileContent, {
          ...options,
          // Generated token files contain no class names for prettier-plugin-tailwindcss to
          // sort, and loading it here requires tailwind.config.js, which in turn requires
          // build/tailwind/tokens.cjs. That file doesn't exist yet this early in the build, so
          // loading the plugin would throw.
          plugins: [],
          parser: 'babel',
        });
        await writeFile(filePath, formattedOutput);
      }),
    );
  },
  undo() {
    // ignore clean function
  },
});

/**
 * Creates style-dictionary config
 * https://styledictionary.com/reference/config/
 *
 * @param {String} buildPath for destination directory
 * @returns {Object} style-dictionary config
 */
const getStyleDictionaryConfigDefault = (buildPath) => {
  return {
    include: ['src/tokens/**/*.tokens.json'],
    source: ['src/tokens/**/*.tokens.json'],
    preprocessors: ['khulnasoft/select-default-value'],
    hooks: {
      filters: {
        isTypographyDesignToken: (token) => {
          return token.$type === 'typography';
        },
        isFigmaSupportedTypeAndConstantDesignToken: (token) => {
          return (
            FIGMA_SUPPORTED_TYPES.includes(token.$type) &&
            !token.$deprecated &&
            token.filePath &&
            token.filePath.includes('/constant/')
          );
        },
        isFigmaSupportedTypeAndNotConstantDesignToken: (token) => {
          return (
            FIGMA_SUPPORTED_TYPES.includes(token.$type) &&
            !token.$deprecated &&
            token.filePath &&
            !token.filePath.includes('/constant/')
          );
        },
      },
    },
    platforms: {
      css: {
        prefix: PREFIX,
        buildPath: `${buildPath}/css/`,
        preprocessors: ['khulnasoft/resolve-units', 'khulnasoft/select-color-value'],
        transformGroup: 'khulnasoft/css',
        options: {
          outputReferences: true,
        },
        expand: {
          include: ['typography'],
        },
        files: [
          {
            destination: 'tokens.css',
            format: 'css/variables',
            options: {
              selector: LIGHT_SELECTOR,
            },
          },
        ],
      },
      js: {
        prefix: PREFIX,
        buildPath: `${buildPath}/js/`,
        preprocessors: [
          'khulnasoft/resolve-units',
          'khulnasoft/select-color-value',
          'khulnasoft/stripDescriptions',
        ],
        transformGroup: 'khulnasoft/js',
        actions: ['prettier'],
        expand: {
          include: ['typography'],
        },
        files: [
          {
            destination: 'tokens.js',
            format: 'javascript/es6',
          },
        ],
      },
      json: {
        buildPath: `${buildPath}/json/`,
        preprocessors: ['khulnasoft/resolve-units', 'khulnasoft/select-color-value'],
        transformGroup: 'khulnasoft/js',
        files: [
          {
            destination: 'tokens.json',
            format: 'json',
          },
        ],
      },
      scss: {
        prefix: PREFIX,
        buildPath: `${buildPath}/scss/`,
        preprocessors: ['khulnasoft/resolve-units', 'khulnasoft/select-color-value'],
        transformGroup: 'khulnasoft/css',
        options: {
          outputReferences: true,
        },
        expand: {
          include: ['typography'],
        },
        files: [
          {
            destination: '_tokens.scss',
            format: 'scss/variables',
          },
          {
            destination: '_tokens_custom_properties.scss',
            format: 'scss/customProperties',
          },
        ],
      },
      docs: {
        buildPath: `${buildPath}/docs/`,
        preprocessors: ['khulnasoft/resolve-units', 'khulnasoft/select-color-value'],
        transformGroup: 'khulnasoft/js',
        files: [
          {
            destination: 'tokens-tailwind-docs.json',
            format: 'docs',
          },
        ],
      },
      tailwind: {
        prefix: PREFIX,
        buildPath: `${buildPath}/tailwind/`,
        preprocessors: ['khulnasoft/resolve-units', 'khulnasoft/select-color-value'],
        transformGroup: 'khulnasoft/tailwind',
        actions: ['prettier'],
        files: [
          {
            destination: 'components.cjs',
            format: 'tailwind/components',
            filter: 'isTypographyDesignToken',
          },
        ],
      },
      figma: {
        buildPath: `${buildPath}/figma/`,
        preprocessors: ['khulnasoft/convert-clamp-string-to-dimension'],
        transformGroup: 'khulnasoft/figma',
        files: [
          {
            destination: 'constants.json',
            format: 'figma',
            filter: 'isFigmaSupportedTypeAndConstantDesignToken',
          },
          {
            destination: 'mode.json',
            format: 'figma',
            filter: 'isFigmaSupportedTypeAndNotConstantDesignToken',
          },
        ],
      },
    },
  };
};

const getStyleDictionaryConfigTailwind = (buildPath = 'dist/tokens') => {
  return {
    source: [`${buildPath}/docs/tokens-tailwind-docs.json`],
    platforms: {
      tailwind: {
        buildPath: `${buildPath}/tailwind/`,
        actions: ['prettier'],
        files: [
          {
            destination: 'tokens.cjs',
            format: 'tailwind',
          },
        ],
      },
    },
  };
};

/**
 * Creates style-dictionary config
 * https://styledictionary.com/reference/config/
 *
 * @returns {Object} style-dictionary config
 */
const getStyleDictionaryConfigDarkMode = (buildPath) => {
  return merge(getStyleDictionaryConfigDefault(buildPath), {
    preprocessors: ['khulnasoft/select-dark-value', 'khulnasoft/resolve-units'],
    platforms: {
      css: {
        files: [
          {
            destination: 'tokens.dark.css',
            options: {
              selector: DARK_SELECTOR,
            },
          },
        ],
      },
      js: {
        files: [
          {
            destination: 'tokens.dark.js',
          },
        ],
      },
      json: {
        files: [
          {
            destination: 'tokens.dark.json',
          },
        ],
      },
      scss: {
        files: [
          {
            destination: '_tokens.dark.scss',
          },
        ],
      },
      docs: {
        files: [
          {
            destination: 'tokens-tailwind-docs.dark.json',
          },
        ],
      },
      figma: {
        files: [
          {
            destination: 'constants.dark.json',
          },
          {
            destination: 'mode.dark.json',
          },
        ],
      },
    },
  });
};

/**
 * Build tokens from config
 */
async function main() {
  try {
    // Clean build directories first to prevent loose files.
    await rm(BUILD_PATH, { recursive: true, force: true });

    // Build tokens using StyleDictionary
    const defaultMode = new StyleDictionary(getStyleDictionaryConfigDefault(BUILD_PATH));
    await defaultMode.buildAllPlatforms();

    const darkMode = new StyleDictionary(getStyleDictionaryConfigDarkMode(BUILD_PATH));
    await darkMode.buildAllPlatforms();

    const tailwindDictionary = new StyleDictionary(getStyleDictionaryConfigTailwind(BUILD_PATH));
    await tailwindDictionary.buildAllPlatforms();
  } catch (error) {
    console.error('🚨 Error building tokens:', error);
    process.exit(1);
  }
}

main();
