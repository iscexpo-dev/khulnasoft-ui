// This contains core mapping behavior (like mapping to native JavaScript types)
// and**should not** contain domain-specific mappers.
//
// ```
// // Good
// export const mapToBoolean = ...
//
// // Bad
// export const mapToApolloCacheWidget = ...
// ```
export const mapToNumber = (x) => Number(x || 0);
