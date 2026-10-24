import { isObject } from 'lodash-es';

/**
 * Purpose is a substitute of Vue.set but with preserving reactivity
 * New object can be assigned to data property of aa component
 * @param source
 * @param key
 * @param value
 * @returns {*}
 */
export const setObjectProperty = (source, key, value = '') => {
  if (!source || !key || !isObject(source)) {
    return {};
  }

  if (typeof key !== 'string') {
    return source;
  }

  return {
    ...source,
    [key]: value,
  };
};
