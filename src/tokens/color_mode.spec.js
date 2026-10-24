import { readFileSync } from 'fs';
import { join } from 'path';
import { DARK_SELECTOR, LIGHT_SELECTOR } from './color_mode';

// If the token build ever stops using these selectors, anything in JavaScript that reasons about
// the colour mode is silently wrong. Assert against the built stylesheets rather than the build
// script, so a hand-edit or a change of build tool is caught too.
describe('color mode selectors', () => {
  const readTokens = (file) =>
    readFileSync(join(__dirname, 'build', 'css', file), 'utf8')
      .split('\n')
      .slice(0, 10)
      .join('\n');

  it.each([
    ['tokens.css', LIGHT_SELECTOR],
    ['tokens.dark.css', DARK_SELECTOR],
  ])('%s is scoped with the selector JavaScript expects', (file, selector) => {
    expect(readTokens(file)).toContain(`${selector} {`);
  });
});
