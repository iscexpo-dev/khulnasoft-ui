import { dashboard, mockPanel } from '../mock_data';
import { dashboardConfigValidator } from './validators';

describe('dashboardConfigValidator', () => {
  const dashboardNoTitle = { ...dashboard, title: undefined };
  const dashboardNoDesc = { ...dashboard, description: undefined };
  const dashboardNoPanel = { ...dashboard, panels: undefined };
  const dashboardNoPanelId = { ...dashboard, panels: [{ ...mockPanel, id: undefined }] };
  const dashboardNoPanelGridAttrs = {
    ...dashboard,
    panels: [{ ...mockPanel, gridAttributes: undefined }],
  };
  const dashboardWithDuplicatePanelIds = {
    ...dashboard,
    panels: [
      { ...mockPanel, id: 'duplicate-id' },
      { ...mockPanel, id: 'duplicate-id' },
    ],
  };
  const dashboardWithUniquePanelIds = {
    ...dashboard,
    panels: [
      { ...mockPanel, id: 'unique-id-1' },
      { ...mockPanel, id: 'unique-id-2' },
    ],
  };

  it.each`
    scenario                            | config                            | expected
    ${'dashboard'}                      | ${dashboard}                      | ${true}
    ${'dashboardNoTitle'}               | ${dashboardNoTitle}               | ${true}
    ${'dashboardNoDesc'}                | ${dashboardNoDesc}                | ${true}
    ${'dashboardNoPanel'}               | ${dashboardNoPanel}               | ${true}
    ${'dashboardNoPanelId'}             | ${dashboardNoPanelId}             | ${false}
    ${'dashboardNoPanelGridAttrs'}      | ${dashboardNoPanelGridAttrs}      | ${false}
    ${'dashboardWithDuplicatePanelIds'} | ${dashboardWithDuplicatePanelIds} | ${false}
    ${'dashboardWithUniquePanelIds'}    | ${dashboardWithUniquePanelIds}    | ${true}
  `('returns $expected when config is $scenario', ({ config, expected }) => {
    const result = dashboardConfigValidator(config);

    expect(result).toBe(expected);
  });
});
