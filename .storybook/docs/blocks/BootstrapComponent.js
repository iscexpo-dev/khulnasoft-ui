import React, { useContext } from 'react';
import { DocsContext, Markdown } from '@storybook/addon-docs';

export const BootstrapComponent = () => {
  const context = useContext(DocsContext);
  const bootstrapDocs = context?.attachedCSFFile?.meta.parameters?.bootstrapDocs;
  const bootstrapComponentName = context?.attachedCSFFile?.meta.parameters?.bootstrapComponent;

  if (!bootstrapDocs && !bootstrapComponentName) {
    return null;
  }

  if (!bootstrapDocs || !bootstrapComponentName) {
    return <p>Please ensure that both bootstrapDocs and bootstrapComponent are defined.</p>;
  }

  const docsFormatted = bootstrapDocs.replace(/^(#+)/gm, '#$1');

  const note = `
  This component uses \`${bootstrapComponentName}\` under the hood.
  You can find the bootstrap-vue docs below.
  Please note that the bootstrap-vue docs are rendered as-is.
   So they will likely reference the components / directives with the \`b-\` prefix instead of the \`gl-\` prefix.
  `;

  return (
    <>
      <div className="gl-alert gl-alert-not-dismissible gl-alert-no-icon gl-alert-has-title gl-alert-info gl-sticky gl-top-0 gl-z-9999">
        <div role="status" aria-live="polite" className="gl-alert-content">
          <span className="gl-alert-title gl-font-bold">BootstrapVue component</span>
          <div className="gl-alert-body">
            <Markdown>{note}</Markdown>
          </div>
        </div>
      </div>

      <div className="bootstrap-vue-docs gl-border gl-border-dashed gl-border-gray-500 gl-p-5">
        <Markdown>{docsFormatted}</Markdown>
      </div>
    </>
  );
};
