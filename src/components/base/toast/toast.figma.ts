import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=20171-225',
  {
    props: {},
    example: () => html`
      <script>
        import { GlToastPlugin } from '@khulnasoft/ui';
        Vue.use(GlToastPlugin);

        this.$toast.show('REPLACE');
        // Optionally include an action (use sparingly, see accessibility guidelines):
        // this.$toast.show('REPLACE', {
        //   action: { text: 'REPLACE', onClick: (e, { hide }) => { hide(); } },
        // });
      </script>
    `,
    imports: [],
  },
);
