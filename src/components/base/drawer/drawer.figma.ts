import figma, { html } from '@figma/code-connect/html';

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125418-1519',
  {
    variant: { 'Has actions': false },
    example: () => html`
      <gl-drawer :open="true" @close="onClose">
        <template #title><h2 class="gl-heading-scale-500 !gl-mb-0">Drawer title</h2></template>
        <!-- body content -->
      </gl-drawer>
    `,
    imports: ["import { GlDrawer } from '@khulnasoft/ui'"],
  },
);

figma.connect(
  'https://www.figma.com/design/qEddyqCrI7kPSBjGmwkZzQ/%F0%9F%93%99-Component-library?node-id=125418-1519',
  {
    variant: { 'Has actions': true },
    example: () => html`
      <gl-drawer :open="true" @close="onClose">
        <template #title><h2 class="gl-heading-scale-500 !gl-mb-0">Drawer title</h2></template>
        <template #header><!-- actions here --></template>
        <!-- body content -->
      </gl-drawer>
    `,
    imports: ["import { GlDrawer } from '@khulnasoft/ui'"],
  },
);
