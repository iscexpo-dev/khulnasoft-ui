export const dashboardConfigValidator = (config) => {
  if (config.panels) {
    if (!Array.isArray(config.panels)) return false;
    if (!config.panels.every((panel) => panel.id && panel.gridAttributes)) return false;

    // Validate that all panel IDs are unique
    const panelIds = config.panels.map((panel) => panel.id);
    const uniquePanelIds = new Set(panelIds);
    if (panelIds.length !== uniquePanelIds.size) return false;
  }

  return true;
};
