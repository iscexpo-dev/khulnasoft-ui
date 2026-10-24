import figma, { html } from '@figma/code-connect/html';

// The Figma "Date picker" component set covers both single and range variants.
// Variant=Range maps to GlDaterangePicker in code.
figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19944-386',
  {
    variant: { Variant: 'Range', Expanded: 'False' },
    example: () => html` <gl-daterange-picker /> `,
    imports: ["import { GlDaterangePicker } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19944-386',
  {
    variant: { Variant: 'Range', Expanded: 'True' },
    example: () => html` <gl-daterange-picker start-opened /> `,
    imports: ["import { GlDaterangePicker } from '@khulnasoft/ui'"],
  },
);
