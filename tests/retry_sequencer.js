const fs = require('node:fs');
const path = require('node:path');
const Sequencer = require('@jest/test-sequencer').default;

const resultsFile = path.join(__dirname, 'results.json');

class RetrySequencer extends Sequencer {
  sort(tests) {
    if (fs.existsSync(resultsFile)) {
      // eslint-disable-next-line no-console
      console.warn('Found previous jest results, reducing tests to failed ones...');

      const { testResults } = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
      const failedFiles = testResults
        .filter((result) => result.status === 'failed')
        .map((result) => result.name);
      return super.sort(tests.filter((test) => failedFiles.includes(test.path)));
    }

    return super.sort(tests);
  }
}

module.exports = RetrySequencer;
