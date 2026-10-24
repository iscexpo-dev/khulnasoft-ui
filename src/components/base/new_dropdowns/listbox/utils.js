import { isNumber, isString } from 'lodash-es';

const isOption = (item) =>
  Boolean(item) && (isString(item.value) || isNumber(item.value) || item.value === null);

// eslint-disable-next-line unicorn/no-array-callback-reference
const isGroup = ({ options } = {}) => Array.isArray(options) && options.every(isOption);

const hasNoDuplicates = (array) => array.length === new Set(array).size;

const flattenedOptions = (items) => items.flatMap((item) => (isOption(item) ? item : item.options));

// eslint-disable-next-line unicorn/no-array-callback-reference
const isAllOptionsOrAllGroups = (items) => items.every(isOption) || items.every(isGroup);

const hasUniqueValues = (items) =>
  hasNoDuplicates(flattenedOptions(items).map(({ value }) => value));

// eslint-disable-next-line unicorn/no-array-callback-reference
const hasUniqueGroups = (items) => hasNoDuplicates(items.filter(isGroup).map(({ text }) => text));

const itemsValidator = (items) =>
  isAllOptionsOrAllGroups(items) && hasUniqueValues(items) && hasUniqueGroups(items);

export { isOption, itemsValidator, flattenedOptions };
