import { PROP_TYPE_ANY } from '../constants/props'
import { identity } from './identity'
import { isArray, isObject, isUndefined } from './inspect'
import { clone, hasOwnProperty, keys } from './object'
import { upperFirst } from './string'

// Suffix can be a falsey value so nothing is appended to string
// (helps when looping over props & some shouldn't change)
// Use data last parameters to allow for currying
export const suffixPropName = (suffix, value) => value + (suffix ? upperFirst(suffix) : '')

// Generates a prop object
export const makeProp = (
  type = PROP_TYPE_ANY,
  value = undefined,
  requiredOrValidator = undefined,
  validator = undefined
) => {
  const required = requiredOrValidator === true
  validator = required ? validator : requiredOrValidator

  return {
    ...(type ? { type } : {}),
    ...(required
      ? { required }
      : isUndefined(value)
        ? {}
        : { default: isObject(value) ? () => value : value }),
    ...(isUndefined(validator) ? {} : { validator })
  }
}

// Copies props from one array/object to a new array/object
// Prop values are also cloned as new references to prevent possible
// mutation of original prop object values
// Optionally accepts a function to transform the prop name
export const copyProps = (props, transformFn = identity) => {
  if (isArray(props)) {
    return props.map(transformFn)
  }
  const copied = {}
  for (const prop in props) {
    /* istanbul ignore else */
    if (hasOwnProperty(props, prop)) {
      // If the prop value is an object, do a shallow clone
      // to prevent potential mutations to the original object
      copied[transformFn(prop)] = isObject(props[prop]) ? clone(props[prop]) : props[prop]
    }
  }
  return copied
}

// Given an array of properties or an object of property keys,
// plucks all the values off the target object, returning a new object
// that has props that reference the original prop values
export const pluckProps = (keysToPluck, objToPluck, transformFn = identity) =>
  (isArray(keysToPluck) ? keysToPluck.slice() : keys(keysToPluck)).reduce((memo, prop) => {
    memo[transformFn(prop)] = objToPluck[prop]
    return memo
  }, {})
