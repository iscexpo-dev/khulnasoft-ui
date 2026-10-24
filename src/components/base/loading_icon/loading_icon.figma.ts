import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=19944-0',
  {
    props: {
      size: figma.enum('Size', {
        sm: '',
        md: 'size="md"',
        lg: 'size="lg"',
        xl: 'size="xl"',
      }),
      color: figma.enum('Appearance', {
        dark: '',
        light: 'color="light"',
      }),
    },
    example: ({ size, color }) => html` <gl-loading-icon ${size} ${color} /> `,
    imports: ["import { GlLoadingIcon } from '@khulnasoft/ui'"],
  },
);
