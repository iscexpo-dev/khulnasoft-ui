import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123733-4517',
  {
    example: () => html` <gl-button icon="ellipsis_h" category="tertiary" aria-label="REPLACE" /> `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123515-16040',
  {
    variant: { 'Is selected': 'false' },
    props: {
      emoji: figma.string('Emoji'),
      count: figma.string('Count'),
    },
    example: ({ emoji, count }) => html`
      <gl-button :count="${count}">
        <template #emoji>${emoji}</template>
      </gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123515-16040',
  {
    variant: { 'Is selected': 'true' },
    props: {
      emoji: figma.string('Emoji'),
      count: figma.string('Count'),
    },
    example: ({ emoji, count }) => html`
      <gl-button :selected="true" :count="${count}">
        <template #emoji>${emoji}</template>
      </gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html` <gl-button ${size} ${icon}>${label}</gl-button> `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / tertiary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button category="tertiary" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button variant="confirm" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / tertiary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button variant="confirm" category="tertiary" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button variant="danger" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / tertiary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button variant="danger" category="tertiary" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'disabled', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button :disabled="true" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'loading', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      label: figma.string('Label'),
    },
    example: ({ size, label }) => html` <gl-button :loading="true" ${size}>${label}</gl-button> `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'selected', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button :selected="true" ${size} ${icon}>${label}</gl-button>
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html` <gl-button icon="REPLACE" ${size} aria-label="REPLACE" /> `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / tertiary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button category="tertiary" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button variant="confirm" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / tertiary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button
        variant="confirm"
        category="tertiary"
        icon="REPLACE"
        ${size}
        aria-label="REPLACE"
      />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button variant="danger" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / tertiary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button variant="danger" category="tertiary" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'selected', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button :selected="true" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'disabled', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button :disabled="true" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'loading', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button :loading="true" icon="REPLACE" ${size} aria-label="REPLACE" />
    `,
    imports: ["import { GlButton } from '@khulnasoft/ui'"],
  },
);
