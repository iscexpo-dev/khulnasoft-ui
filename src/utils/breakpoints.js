export const breakpoints = {
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576,
  xs: 0,
};

export const GlBreakpointInstance = {
  windowWidth: () => window.innerWidth,
  getBreakpointSize() {
    const windowWidth = this.windowWidth();

    const breakpoint = Object.keys(breakpoints).find((key) => windowWidth > breakpoints[key]);

    return breakpoint;
  },
  isDesktop() {
    return ['xl', 'lg'].includes(this.getBreakpointSize());
  },
};
