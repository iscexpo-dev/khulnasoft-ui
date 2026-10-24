import { VBTooltip } from '../../vendor/bootstrap-vue/src/directives/tooltip';
import { getGlTooltipDefaultContainer } from './container';

const patchHook = (hook) => (el, bindings, vnode) => {
  hook(
    el,
    {
      ...bindings,
      arg: bindings.arg || getGlTooltipDefaultContainer(),
    },
    vnode,
  );
};

const bind = patchHook(VBTooltip.bind);
const componentUpdated = patchHook(VBTooltip.componentUpdated);

export const GlTooltipDirective = {
  ...VBTooltip,
  bind,
  componentUpdated,
};
