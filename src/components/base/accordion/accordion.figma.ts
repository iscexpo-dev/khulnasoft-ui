import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19911-8',
  {
    variant: { 'Is expanded': 'false' },
    props: {
      title: figma.string('Header'),
      body: figma.string('Item body'),
    },
    // header-level is not exposed in Figma; 3 is used as a sensible default
    example: ({ title, body }) => html`
      <gl-accordion :header-level="3">
        <gl-accordion-item title="${title}">${body}</gl-accordion-item>
      </gl-accordion>
    `,
    imports: ["import { GlAccordion, GlAccordionItem } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19911-8',
  {
    variant: { 'Is expanded': 'true' },
    props: {
      title: figma.string('Header'),
      body: figma.string('Item body'),
    },
    // header-level is not exposed in Figma; 3 is used as a sensible default
    example: ({ title, body }) => html`
      <gl-accordion :header-level="3">
        <gl-accordion-item title="${title}" :visible="true">${body}</gl-accordion-item>
      </gl-accordion>
    `,
    imports: ["import { GlAccordion, GlAccordionItem } from '@khulnasoft/ui'"],
  },
);
