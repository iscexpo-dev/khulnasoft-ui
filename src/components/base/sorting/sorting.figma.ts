// url=https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123918-20385
import figma from 'figma';

// `GlSorting` is a component SET with two variant axes:
//   - `Sort direction` (ascending | descending) -> the `is-ascending` prop
//   - `State`          (rest | hover/focus/active) -> interaction states, no code equivalent
//
// `Label` (TEXT) maps to the dropdown toggle `text` prop.
//
// `sort-options` / `sort-by` are not represented in the Figma design, so we emit
// bindable placeholders (sortOptions / sortBy) for the dev to wire up.
const instance = figma.selectedInstance;

const label = instance.getString('Label');

// `Sort direction` is a VARIANT axis (values "ascending"/"descending"), so read
// it with getEnum, not getBoolean. `descending` is the default -> no attribute.
const direction = instance.getEnum('Sort direction', {
  descending: '',
  ascending: '\n  :is-ascending="true"',
});

export default {
  id: 'gl-sorting',
  imports: ["import { GlSorting } from '@khulnasoft/ui'"],
  example: figma.code`<gl-sorting
  text="${label}"
  :sort-options="sortOptions"
  :sort-by="sortBy"${direction}
/>`,
  metadata: {
    nestable: true,
  },
};
