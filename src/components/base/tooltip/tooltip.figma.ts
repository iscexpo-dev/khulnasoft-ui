import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=121178-28119',
  {
    props: {
      placement: figma.enum('Position', {
        above: '',
        right: '.right',
        below: '.bottom',
        left: '.left',
      }),
      content: figma.string('Content'),
    },
    example: ({ placement, content }) => html`
      <script>
        import { GlTooltipDirective } from '@khulnasoft/ui';
        export default { directives: { GlTooltip: GlTooltipDirective } };
      </script>

      <!-- Replace your-trigger with the trigger element -->
      <your-trigger v-gl-tooltip${placement} title="${content}"> Trigger </your-trigger>
    `,
    imports: [],
  },
);
