import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19944-386',
  {
    variant: { Variant: 'Single', Expanded: 'False' },
    props: {
      label: figma.nestedProps('Label', {
        text: figma.string('Label text'),
      }),
    },
    example: ({ label }) => html`
      <gl-form-group label="${label.text}" label-for="datepicker">
        <gl-datepicker input-id="datepicker" />
      </gl-form-group>
    `,
    imports: ["import { GlDatepicker, GlFormGroup } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19944-386',
  {
    variant: { Variant: 'Single', Expanded: 'True' },
    props: {
      label: figma.nestedProps('Label', {
        text: figma.string('Label text'),
      }),
    },
    example: ({ label }) => html`
      <gl-form-group label="${label.text}" label-for="datepicker">
        <gl-datepicker input-id="datepicker" start-opened />
      </gl-form-group>
    `,
    imports: ["import { GlDatepicker, GlFormGroup } from '@khulnasoft/ui'"],
  },
);
