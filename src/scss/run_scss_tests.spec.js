/**
 * @jest-environment node
 *
 * sassTrue.runSass cannot find the file when testEnvironment is set to `test`
 * only with dart-sass.
 * See https://github.com/oddbird/true/issues/156
 */

const fs = require('fs');
const path = require('path');
const sassTrue = require('sass-true');

const testFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('.spec.scss'))
  .map((file) => path.resolve(__dirname, file));

testFiles.forEach((file) => {
  sassTrue.runSass(
    {
      describe,
      it,
    },
    file,
  );
});
