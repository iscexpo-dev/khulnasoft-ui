import figma, { html } from '@figma/code-connect/html';

// ─── Button group / Options ───────────────────────────────────────────────────
// Figma ❖ Button group / Options maps to GlButtonGroup wrapping GlButtons where
// the active button uses Style=selected in Figma, which causes the child
// Button Code Connect to emit :selected="true" automatically.

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125969-4528',
  {
    props: {
      vertical: figma.enum('Is vertical', { true: 'vertical', false: '' }),
      buttons: figma.children('Button *'),
    },
    example: ({ vertical, buttons }) => html`
      <gl-button-group ${vertical}> ${buttons} </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton } from '@khulnasoft/ui'"],
  },
);

// ─── Button group / Actions ───────────────────────────────────────────────────
// Figma ❖ Button group / Actions maps to GlButtonGroup wrapping GlButtons with
// no selected state — used to group related actions.

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125951-4496',
  {
    props: {
      vertical: figma.enum('Is vertical', { true: 'vertical', false: '' }),
      buttons: figma.children('Button *'),
    },
    example: ({ vertical, buttons }) => html`
      <gl-button-group ${vertical}> ${buttons} </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton } from '@khulnasoft/ui'"],
  },
);

// ─── Split dropdown button ────────────────────────────────────────────────────
// The Figma ❖ Split dropdown button component maps to GlButtonGroup wrapping
// a GlButton (primary action) and a GlDisclosureDropdown (caret toggle).
// There is no single split-button component in code — this is a composition pattern.

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'default / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button-group>
        <gl-button ${size} ${icon}>${label}</gl-button>
        <gl-disclosure-dropdown toggle-text="REPLACE" :text-sr-only="true" :items="[]" ${size} />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'default / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button-group>
        <gl-button icon="REPLACE" ${size} aria-label="REPLACE" />
        <gl-disclosure-dropdown toggle-text="REPLACE" :text-sr-only="true" :items="[]" ${size} />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'confirm / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button-group>
        <gl-button variant="confirm" ${size} ${icon}>${label}</gl-button>
        <gl-disclosure-dropdown
          toggle-text="REPLACE"
          :text-sr-only="true"
          :items="[]"
          variant="confirm"
          ${size}
        />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'confirm / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button-group>
        <gl-button variant="confirm" icon="REPLACE" ${size} aria-label="REPLACE" />
        <gl-disclosure-dropdown
          toggle-text="REPLACE"
          :text-sr-only="true"
          :items="[]"
          variant="confirm"
          ${size}
        />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'danger / primary', Type: 'text' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
      icon: figma.boolean('Has icon', { true: 'icon="REPLACE"', false: '' }),
      label: figma.string('Label'),
    },
    example: ({ size, icon, label }) => html`
      <gl-button-group>
        <gl-button variant="danger" ${size} ${icon}>${label}</gl-button>
        <gl-disclosure-dropdown
          toggle-text="REPLACE"
          :text-sr-only="true"
          :items="[]"
          variant="danger"
          ${size}
        />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=123024-2869',
  {
    variant: { Style: 'danger / primary', Type: 'icon only' },
    props: {
      size: figma.enum('Size', { sm: 'size="small"', 'md (default)': '' }),
    },
    example: ({ size }) => html`
      <gl-button-group>
        <gl-button variant="danger" icon="REPLACE" ${size} aria-label="REPLACE" />
        <gl-disclosure-dropdown
          toggle-text="REPLACE"
          :text-sr-only="true"
          :items="[]"
          variant="danger"
          ${size}
        />
      </gl-button-group>
    `,
    imports: ["import { GlButtonGroup, GlButton, GlDisclosureDropdown } from '@khulnasoft/ui'"],
  },
);
