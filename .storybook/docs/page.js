import React, { useContext } from 'react';
import {
  Title,
  Subtitle,
  Description,
  Primary,
  ArgsTable,
  PRIMARY_STORY,
  DocsContext,
} from '@storybook/addon-docs';
import { ImportInfo, BootstrapComponent as BootstrapVueDescription, LinkToSource } from './blocks';

export const page = () => {
  const context = useContext(DocsContext);
  const componentName = context?.attachedCSFFile?.meta?.component?.name;
  const title = componentName ? <h1 className="!gl-m-0">{componentName}</h1> : <Title />;

  return (
    <div className="gl-py-5">
      <div className="!gl-mb-4 gl-flex gl-items-center">
        {title}
        <LinkToSource />
      </div>
      <Subtitle />
      <ImportInfo />
      <Primary />
      <ArgsTable story={PRIMARY_STORY} />
      <Description />
      <BootstrapVueDescription />
    </div>
  );
};
