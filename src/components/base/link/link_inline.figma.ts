// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=84073-117532
import figma from 'figma';

// `Link / Inline text link` maps to `GlLink` with `variant="inline"`. Its
// `External link` BOOLEAN toggles the external-link affordance, which in code
// requires both `show-external-icon` and an external `target`. The `Size` axis
// maps to a KhulnaSoft text-size utility class (Default omits it); `State` is
// design-only.
const instance = figma.selectedInstance;

const text = instance.getString('Text');
const external = instance.getBoolean('External link');

const size = instance.getEnum('Size', { Default: '', sm: 'gl-text-sm', lg: 'gl-text-lg' });
const classAttr = size ? ` class="${size}"` : '';

export default {
  id: 'gl-link-inline',
  imports: ["import { GlLink } from '@khulnasoft/ui'"],
  example: external
    ? figma.code`<gl-link href="#" variant="inline"${classAttr} show-external-icon target="_blank">${text}</gl-link>`
    : figma.code`<gl-link href="#" variant="inline"${classAttr}>${text}</gl-link>`,
  metadata: {
    nestable: true,
  },
};
