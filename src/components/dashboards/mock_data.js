import { uniqueId } from 'lodash-es';

export const getUniquePanelId = () => uniqueId('panel-');

export const dashboard = {
  id: 'analytics_overview',
  slug: 'analytics_overview',
  title: 'Analytics Overview',
  description: 'This is a dashboard',
  userDefined: true,
  panels: [
    {
      title: 'Test A',
      gridAttributes: { width: 3, height: 3, xPos: 0, yPos: 0 },
      id: getUniquePanelId(),
    },
    {
      title: 'Test B',
      gridAttributes: { width: 2, height: 4, xPos: 1, yPos: 1, minHeight: 2, minWidth: 2 },
      id: getUniquePanelId(),
    },
  ],
  status: null,
  errors: null,
};

export const mockPanel = {
  title: 'Test A',
  gridAttributes: {
    width: 1,
    height: 2,
    xPos: 0,
    yPos: 3,
    minWidth: 1,
    minHeight: 2,
    maxWidth: 1,
    maxHeight: 2,
  },
  id: getUniquePanelId(),
};
