const { TestEnvironment } = require('jest-environment-jsdom');

class CustomEnvironment extends TestEnvironment {
  constructor(...args) {
    super(...args);

    // Expose jsdom (created in super class) on the global object so that we
    // can properly set `window.location` with the `setWindowLocation` test
    // helper.
    this.global.jsdom = this.dom;
  }
}

module.exports = CustomEnvironment;
