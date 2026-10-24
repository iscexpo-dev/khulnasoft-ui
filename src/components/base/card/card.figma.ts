import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=131253-16294',
  {
    props: {
      heading: figma.string('Heading'),
    },
    example: ({ heading }) => html`<h3 class="gl-heading-scale-300 gl-mb-0">${heading}</h3>`,
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=131253-16295',
  {
    props: {
      body: figma.string('Body'),
    },
    example: ({ body }) => html`<p>${body}</p>`,
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=131253-16296',
  {
    props: {
      footer: figma.string('Footer'),
    },
    example: ({ footer }) => html`<p class="gl-text-sm gl-text-subtle">${footer}</p>`,
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=131253-16597',
  {
    props: {
      headerSlotOpen: figma.boolean('Has header', {
        true: '<template #header>',
        false: '',
      }),
      headerContent: figma.instance('Header content'),
      headerSlotClose: figma.boolean('Has header', {
        true: '</template>',
        false: '',
      }),
      bodyContent: figma.instance('Body content'),
      footerSlotOpen: figma.boolean('Has footer', {
        true: '<template #footer>',
        false: '',
      }),
      footerContent: figma.instance('Footer content'),
      footerSlotClose: figma.boolean('Has footer', {
        true: '</template>',
        false: '',
      }),
    },
    example: ({
      headerSlotOpen,
      headerContent,
      headerSlotClose,
      bodyContent,
      footerSlotOpen,
      footerContent,
      footerSlotClose,
    }) => html`
      <gl-card>
        ${headerSlotOpen}${headerContent}${headerSlotClose} ${bodyContent}
        ${footerSlotOpen}${footerContent}${footerSlotClose}
      </gl-card>
    `,
    imports: ["import { GlCard } from '@khulnasoft/ui'"],
  },
);
