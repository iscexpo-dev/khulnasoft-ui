import figma, { html } from '@figma/code-connect/html';

// In Figma, the dropdown trigger and panel are separate components. The trigger
// is part of the ❖ Button component set (Type: dropdown / icon only dropdown),
// while the panel is a separate ❖ Dropdown component. GlDisclosureDropdown
// combines both into a single component in code.

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / primary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown toggle-text="${label}" :items="[]" ${icon} ${size} />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / tertiary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown
        toggle-text="${label}"
        :items="[]"
        category="tertiary"
        ${icon}
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / primary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown
        toggle-text="${label}"
        :items="[]"
        variant="confirm"
        ${icon}
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / tertiary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown
        toggle-text="${label}"
        :items="[]"
        variant="confirm"
        category="tertiary"
        ${icon}
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / primary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown toggle-text="${label}" :items="[]" variant="danger" ${icon} ${size} />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / tertiary', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown
        toggle-text="${label}"
        :items="[]"
        variant="danger"
        category="tertiary"
        ${icon}
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'disabled', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-disclosure-dropdown toggle-text="${label}" :items="[]" :disabled="true" ${icon} ${size} />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'loading', Type: 'dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      label: figma.string('Label'),
    },
    example: ({ size, label }) => html`
      <gl-disclosure-dropdown toggle-text="${label}" :items="[]" :loading="true" ${size} />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / primary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'default / tertiary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        category="tertiary"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / primary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        variant="confirm"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'confirm / tertiary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        variant="confirm"
        category="tertiary"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / primary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        variant="danger"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'danger / tertiary', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        variant="danger"
        category="tertiary"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'disabled', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        :disabled="true"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=122559-8763',
  {
    variant: { Style: 'loading', Type: 'icon only dropdown' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-disclosure-dropdown
        icon="REPLACE"
        toggle-text="REPLACE"
        :text-sr-only="true"
        :items="[]"
        :loading="true"
        ${size}
      />
    `,
    imports: ["import { GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);
