// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=136188-233
import figma from 'figma';

// `GlAttributeList` renders a data-driven list of attributes. In Figma the list
// is a component SET with two variant axes:
//   - `Is stacked` (false | true) -> the `layout` prop (horizontal | vertical)
//   - `Attributes`  (2..8)         -> the number of `Attribute` child instances
//
// There is no `layout` attribute for the default (horizontal) layout, so only
// the vertical case renders one. There is also no standalone code component for
// a single attribute — each one is a plain object in the `items` array:
//
//   { icon: 'merge', label: 'Merged by', text: 'User Beta' }
//
// The attributes are instances named `Attribute 1`..`Attribute N`, nested inside
// `Row` frames. We collect all layers (a flat name-based filter is reliable here,
// whereas the selector predicate of findLayers/findConnectedInstances does not
// see these instances through the intermediate frames), then read each one's
// `Label`/`Value` text props plus its `Icon` INSTANCE_SWAP. Layers come back in
// reverse document order, so we sort by the numeric suffix in the name. KhulnaSoft
// Product Icons expose their name via `metadata.props.name` on their own Code
// Connect template; if an icon has no Code Connect we fall back to a `REPLACE`
// placeholder.
//
// The item snippets are folded into a SINGLE figma.code snippet (comma-separated)
// rather than passed as an array — interpolating an array of snippets into
// figma.code renders nothing.
const instance = figma.selectedInstance;

const layout = instance.getEnum('Is stacked', {
  false: '',
  true: ' layout="vertical"',
});

const matched = instance
  .findLayers(() => true, { traverseInstances: true })
  .filter((node) => String(node.name).startsWith('Attribute '))
  .sort((a, b) => {
    const numA = parseInt(String(a.name).replace('Attribute ', ''), 10);
    const numB = parseInt(String(b.name).replace('Attribute ', ''), 10);
    return numA - numB;
  });

const items = matched.reduce(
  (acc, attribute, index) => {
    const label = attribute.getString('Label');
    const text = attribute.getString('Value');
    const icon =
      attribute.getInstanceSwap('Icon')?.executeTemplate()?.metadata?.props?.name ?? 'REPLACE';
    const item = figma.code`{ icon: '${icon}', label: '${label}', text: '${text}' }`;
    return index === 0 ? figma.code`${item}` : figma.code`${acc}, ${item}`;
  },
  figma.code``,
);

export default {
  id: 'attribute-list',
  imports: ["import { GlAttributeList } from '@khulnasoft/ui'"],
  example: figma.code`<gl-attribute-list${layout} :items="[${items}]" />`,
  metadata: {
    nestable: false,
  },
};
