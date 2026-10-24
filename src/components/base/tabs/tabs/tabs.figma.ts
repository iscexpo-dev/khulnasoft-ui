// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123608-8100
import figma from 'figma';

const instance = figma.selectedInstance;

// Inline attr helper — adds the leading space + `name="value"` wrapper, and
// renders nothing for an empty value. Must be defined inline (only 'figma' may
// be imported). See the create-code-connect-template skill.
const attr = (name, value) => (value ? ` ${name}="${value}"` : '');

// `Is justified` is a VARIANT axis whose values are "false (default)" and
// "true" (note the exact key with a space), so read it with getEnum.
const justified = attr(
  ':justified',
  instance.getEnum('Is justified', { 'false (default)': '', true: 'true' }),
);

// The selector predicate does not see instances nested through frames, so match
// everything and filter on the returned handles by name. findLayers returns
// layers in reverse document order, so reverse to restore left-to-right order.
const tabs = instance
  .findLayers(() => true, { traverseInstances: true })
  .filter((node) => String(node.name) === 'Tab item')
  .reverse();

// The active tab is the one whose `Is current` variant axis is "true". GlTabs
// tracks the active tab via a 0-based `value` index; default is 0 (first tab).
const activeIndex = tabs.findIndex(
  (tab) => tab.getEnum('Is current', { true: true, false: false }) === true,
);
const valueAttr = attr(':value', activeIndex > 0 ? String(activeIndex) : '');

const items = tabs.reduce(
  (acc, tab, index) => {
    const title = tab.getString('Title');
    const hasBadge = tab.getBoolean('Has badge');
    // The Figma count layer may include a thousands separator (e.g. "1,500");
    // strip non-digits so `:tab-count` binds a valid number.
    const count = String(tab.getString('↳ Count')).replace(/\D/g, '');
    // `tab-count` renders an aria-hidden badge, so `tab-count-sr-text` is the
    // sole screen-reader announcement and carries the count via n__().
    const countAttr =
      hasBadge && count
        ? ` :tab-count="${count}" :tab-count-sr-text="n__('%d item', '%d items', ${count})"`
        : '';
    const item = figma.code`<gl-tab title="${title}"${countAttr}>
    Tab content
  </gl-tab>`;
    return index === 0
      ? figma.code`${item}`
      : figma.code`${acc}
  ${item}`;
  },
  figma.code``,
);

export default {
  id: 'gl-tabs',
  imports: ["import { GlTabs, GlTab } from '@khulnasoft/ui'"],
  example: figma.code`<gl-tabs${justified}${valueAttr}>
  ${items}
</gl-tabs>`,
  metadata: { nestable: false },
};
