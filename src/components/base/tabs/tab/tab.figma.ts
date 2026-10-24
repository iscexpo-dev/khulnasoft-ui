// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123607-1296
import figma from 'figma';

const instance = figma.selectedInstance;
const title = instance.getString('Title');
const hasBadge = instance.getBoolean('Has badge');
// The Figma count layer may include a thousands separator (e.g. "1,500");
// strip non-digits so `:tab-count` binds a valid number.
const count = String(instance.getString('↳ Count')).replace(/\D/g, '');

// `tab-count` renders a neutral (aria-hidden) badge next to the title. The
// paired `tab-count-sr-text` is the sole screen-reader announcement, so it
// carries the count and a translated unit label via n__() per the GlTab docs.
const countAttr =
  hasBadge && count
    ? ` :tab-count="${count}" :tab-count-sr-text="n__('%d item', '%d items', ${count})"`
    : '';

export default {
  id: 'gl-tab',
  imports: ["import { GlTab } from '@khulnasoft/ui'"],
  example: figma.code`<gl-tab title="${title}"${countAttr}>
  Tab content
</gl-tab>`,
  metadata: { nestable: true },
};
