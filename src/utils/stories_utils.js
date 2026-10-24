/**
 * Builds the parameters object disable one or multiple controls.
 */
export const disableControls = (controls = []) =>
  Object.fromEntries(controls.map((control) => [control, { control: { disable: true } }]));

export const getA11yParameters = ({ skipRules = [], temporarySkipRules = [] } = {}) => {
  const skippedRules = skipRules.concat(temporarySkipRules).map((id) => ({ id, enabled: false }));
  return {
    config: {
      rules: skippedRules,
    },
  };
};

/**
 * Returns a boolean indicating whether the given prop type includes the given type.
 *
 * Vue itself checks the string tag to avoid cross-realm false negatives, but
 * that isn't necessary under Storybook.
 *
 * @param {(Array|Function)} propType The prop's defined type from a ComponentOptions.props[prop] object.
 * @returns {boolean}
 */
const isPropType = (propType, Type) =>
  Array.isArray(propType) ? propType.includes(Type) : propType === Type;

/**
 * Returns a function which returns the given prop's default value for the given component.
 *
 * If the default value is a function, it executes that function to return the
 * true default value.
 *
 * @param {object} ComponentOptions A Vue ComponentOptions object.
 */
export const propDefaultFactory = (ComponentOptions) => (prop) => {
  const { type, default: defaultValue } = ComponentOptions.props[prop];

  if (typeof defaultValue === 'function' && !isPropType(type, Function)) {
    // Note: Vue 2 passes the instance to the `default` function via `this`,
    // whereas Vue 3 passes the raw props to it as an argument. Here, we do
    // neither, since we have access to neither. See
    // https://v3-migration.vuejs.org/breaking-changes/props-default-this.html.
    return defaultValue.call(undefined);
  }

  return defaultValue;
};
