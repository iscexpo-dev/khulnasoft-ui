import { escape } from 'lodash-es';
import { i18n } from '../config';

const defaultPluralHandler = (n, singleValue, pluralValue) => {
  const value = n === 1 ? singleValue : pluralValue;

  return value.replace(/%d/g, n);
};

/**
 * Marks a label as translatable and pluralized.
 *
 * @param {*} key Translation key to be leveraged by the consumer to provide a generic translation at configuration time.
 * @param {*} singularValue The singular value to be relied on if the consumer doesn't have translation capabilities.
 * @param {*} pluralValue The plural value to be relied on if the consumer doesn't have translation capabilities.
 * @returns {function} A function that takes a number and returns the pluralized translated label.
 */
export const translatePlural = (key, singularValue, pluralValue) => {
  if (i18n[key]) {
    return i18n[key];
  }
  return (x) => defaultPluralHandler(x, singularValue, pluralValue);
};

/**
 * Very limited implementation of sprintf supporting only named parameters.
 * Copied from the KhulnaSoft repo: https://github.com/khulnasoft/khulnasoft/-/blob/0dff8b02accb3dccbf6cd31236834c37013aad59/app/assets/javascripts/locale/sprintf.js.
 * @param {string} input - (translated) text with parameters (e.g. '%{num_users} users use us')
 * @param {Object.<string, string|number>} [parameters] - object mapping parameter names to values (e.g. { num_users: 5 })
 * @param {boolean} [escapeParameters=true] - whether parameter values should be escaped (see https://lodash.com/docs/4.17.15#escape)
 * @returns {string} the text with parameters replaces (e.g. '5 users use us')
 * @see https://ruby-doc.org/core-2.3.3/Kernel.html#method-i-sprintf
 * @see https://khulnasoft.com/khulnasoft-org/khulnasoft-foss/issues/37992
 */
export function sprintf(input, parameters, escapeParameters = true) {
  let output = input;

  output = output.replace(/%+/g, '%');

  if (parameters) {
    const mappedParameters = new Map(Object.entries(parameters));

    mappedParameters.forEach((key, parameterName) => {
      const parameterValue = mappedParameters.get(parameterName);
      const escapedParameterValue = escapeParameters ? escape(parameterValue) : parameterValue;
      // Pass the param value as a function to ignore special replacement patterns like $` and $'.
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#syntax
      output = output.replace(new RegExp(`%{${parameterName}}`, 'g'), () => escapedParameterValue);
    });
  }

  return output;
}

/**
 * Mark a label as translatable.
 *
 * @param {string} key Translation key to be leveraged by the consumer to provide a generic translation at configuration time.
 * @param {string} defaultValue A fallback value to be relied on if the consumer doesn't have translation capabilities.
 * @param {Object.<string, string|number>} [parameters] - Optional object mapping parameter names to values for sprintf substitution.
 * @returns {string} The translated label.
 */
export const translate = (key, defaultValue, parameters) => {
  const translatedValue = i18n[key] ?? defaultValue;
  return parameters ? sprintf(translatedValue, parameters) : translatedValue;
};
