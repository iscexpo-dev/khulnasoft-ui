import { userEvent } from '@storybook/test';

export const triggerBlurEvent = async () =>
  userEvent.pointer([
    {
      keys: '[MouseLeft]',
      coords: { x: 0, y: 0 },
    },
  ]);
