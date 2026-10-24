/**
 * Wrapper around setTimeout which executes immediately in visual tests
 * in order to avoid flaky tests
 */
export function setStoryTimeout(fn, timeout) {
  return setTimeout(fn, process.env.IS_VISUAL_TEST ? 0 : timeout);
}

// adopted this method from Bootstraps utils
// https://github.com/bootstrap-vue/bootstrap-vue/blob/2fd03f0b1d0cc41f9930078ba8b1c16b10e4ac2f/tests/utils.js#L6
export const waitForAnimationFrame = () =>
  new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });

export const getResetAnimationsCSS = () => `
  *, *::after, *::before {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;

    -webkit-animation: none !important;
    -moz-animation: none !important;
    -ms-animation: none !important;
    -o-animation: none !important;
    animation: none !important;
  }

  input, textarea {
    caret-color: transparent !important;
  }`;
