const getKey = (name) => `$_gl_jest_${name}`;

export const getBinding = (el, name) => el[getKey(name)];

const writeBindingToElement = (el, name, { value, arg, modifiers }) => {
  el[getKey(name)] = {
    value,
    arg,
    modifiers,
  };
};

export const createMockDirective = (name) => ({
  bind(el, binding) {
    writeBindingToElement(el, name, binding);
  },

  update(el, binding) {
    writeBindingToElement(el, name, binding);
  },

  unbind(el) {
    delete el[getKey(name)];
  },
});
