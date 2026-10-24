import { isFunction } from './inspect'

// --- Static ---

export const from = (...args) => Array.from(...args)

// --- Instance ---

export const concat = (...args) => Array.prototype.concat.apply([], args)

// --- Utilities ---

export const createArray = (length, fillFn) => {
  const mapFn = isFunction(fillFn) ? fillFn : () => fillFn
  return Array.apply(null, { length }).map(mapFn)
}
