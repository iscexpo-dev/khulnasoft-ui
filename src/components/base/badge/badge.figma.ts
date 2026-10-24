import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121748-1095',
  {
    variant: { Icon: 'None', Label: true },
    props: {
      variant: figma.enum('Variant', {
        neutral: '',
        info: 'variant="info"',
        success: 'variant="success"',
        warning: 'variant="warning"',
        danger: 'variant="danger"',
        tier: 'variant="tier"',
      }),
      label: figma.string('↳ Text'),
    },
    example: ({ variant, label }) => html` <gl-badge ${variant}>${label}</gl-badge> `,
    imports: ["import { GlBadge } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121748-1095',
  {
    variant: { Icon: '16px', Label: true },
    props: {
      variant: figma.enum('Variant', {
        neutral: '',
        info: 'variant="info"',
        success: 'variant="success"',
        warning: 'variant="warning"',
        danger: 'variant="danger"',
        tier: 'variant="tier"',
      }),
      label: figma.string('↳ Text'),
    },
    example: ({ variant, label }) => html`
      <gl-badge ${variant} icon="REPLACE">${label}</gl-badge>
    `,
    imports: ["import { GlBadge } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121748-1095',
  {
    variant: { Icon: '16px', Label: false },
    props: {
      variant: figma.enum('Variant', {
        neutral: '',
        info: 'variant="info"',
        success: 'variant="success"',
        warning: 'variant="warning"',
        danger: 'variant="danger"',
        tier: 'variant="tier"',
      }),
      label: figma.string('↳ Text'),
    },
    example: ({ variant, label }) => html`
      <gl-badge ${variant} icon="REPLACE" aria-label="${label}"></gl-badge>
    `,
    imports: ["import { GlBadge } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121748-1095',
  {
    variant: { Icon: '12px', Label: true },
    props: {
      variant: figma.enum('Variant', {
        neutral: '',
        info: 'variant="info"',
        success: 'variant="success"',
        warning: 'variant="warning"',
        danger: 'variant="danger"',
        tier: 'variant="tier"',
      }),
      label: figma.string('↳ Text'),
    },
    example: ({ variant, label }) => html`
      <gl-badge ${variant} icon="REPLACE" icon-size="sm">${label}</gl-badge>
    `,
    imports: ["import { GlBadge } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121748-1095',
  {
    variant: { Icon: '12px', Label: false },
    props: {
      variant: figma.enum('Variant', {
        neutral: '',
        info: 'variant="info"',
        success: 'variant="success"',
        warning: 'variant="warning"',
        danger: 'variant="danger"',
        tier: 'variant="tier"',
      }),
      label: figma.string('↳ Text'),
    },
    example: ({ variant, label }) => html`
      <gl-badge ${variant} icon="REPLACE" icon-size="sm" aria-label="${label}"></gl-badge>
    `,
    imports: ["import { GlBadge } from '@khulnasoft/ui'"],
  },
);
