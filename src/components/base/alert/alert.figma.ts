import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=124931-1309',
  {
    props: {
      variant: figma.enum('Variant', {
        danger: 'danger',
        warning: 'warning',
        success: 'success',
        info: 'info',
        tip: 'tip',
      }),
      title: figma.boolean('Has title', {
        true: figma.string('↳ Title'),
        false: '',
      }),
      message: figma.string('Text'),
      dismissible: figma.boolean('Is dismissible', {
        true: '@dismiss="onDismiss"',
        false: ':dismissible="false"',
      }),
      primaryButton: figma.nestedProps('primary-button', {
        label: figma.string('Label'),
      }),
      secondaryButton: figma.nestedProps('secondary-button', {
        label: figma.string('Label'),
      }),
      actions: figma.boolean('Has actions', {
        true: '@primary-action="onPrimaryAction" @secondary-action="onSecondaryAction"',
        false: '',
      }),
    },
    example: ({
      variant,
      title,
      message,
      dismissible,
      primaryButton,
      secondaryButton,
      actions,
    }) => html`
      <gl-alert
        title="${title}"
        variant="${variant}"
        primary-button-text="${primaryButton.label}"
        secondary-button-text="${secondaryButton.label}"
        ${dismissible}
        ${actions}
      >
        ${message}
      </gl-alert>
    `,
    imports: ["import { GlAlert } from '@khulnasoft/ui'"],
  },
);
