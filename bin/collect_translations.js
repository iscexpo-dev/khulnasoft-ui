#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const prettier = require('prettier');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { sortBy } = require('lodash-es');

const isTranslationHelperCall = (node) => node.callee.name === 'translate';

const isTranslationPluralHelperCall = (node) => node.callee.name === 'translatePlural';

const walkTranslationHelperCalls = (ast, handler) => {
  walk.simple(ast, {
    CallExpression(node) {
      if (isTranslationHelperCall(node) || isTranslationPluralHelperCall(node)) {
        handler(node);
      }
    },
  });
};

const getDefaultValueAsJavaScript = (node) => {
  if (isTranslationHelperCall(node)) {
    return node.arguments[1].raw;
  }

  return 'null';
};

const getJavascript = (file) => {
  const content = fs.readFileSync(file).toString();
  if (file.endsWith('.vue')) {
    const match = content.match(/<script>([\s\S]*)<\/script>/);
    return match?.[1] ?? '';
  }
  return content;
};

const getFilesToParse = async () => {
  return glob('./src/**/*.{js,vue}', {
    nodir: true,
    ignore: {
      childrenIgnored: ({ name }) => name === 'vendor',
      ignored: ({ name }) => name.endsWith('stories.js') || name.endsWith('spec.js'),
    },
  });
};

const buildTranslationsObject = (files) => {
  const unsortedLines = files.reduce((findings, file) => {
    const javascript = getJavascript(file);

    walkTranslationHelperCalls(
      acorn.parse(javascript, { ecmaVersion: 'latest', sourceType: 'module' }),
      (node) => {
        const translationKey = node.arguments[0].value;
        const translationValue = getDefaultValueAsJavaScript(node);
        findings.push(`'${translationKey}': ${translationValue},`);
        console.warn(
          `Found translation key '${translationKey}' in ${path.relative(process.cwd(), file)}`,
        );
      },
    );

    return findings;
  }, []);

  const lines = sortBy(unsortedLines);
  lines.unshift('/* eslint-disable import-x/no-default-export */', 'export default {');
  lines.push('}');

  return lines.join('\n');
};

const main = async () => {
  const filesToParse = await getFilesToParse();
  const output = buildTranslationsObject(filesToParse);
  const options = await prettier.resolveConfig(filesToParse[0]);
  const formattedOutput = await prettier.format(output, { ...options, parser: 'babel' });
  process.stdout.write(formattedOutput);
};

main();
