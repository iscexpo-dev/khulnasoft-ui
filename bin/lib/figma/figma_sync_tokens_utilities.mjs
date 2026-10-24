/**
 * Compare two values for equality, handling different types
 * @param {*} value1 - First value
 * @param {*} value2 - Second value
 * @returns {boolean} True if values are equal
 */
export function valuesAreEqual(value1, value2) {
  // Handle null/undefined
  if (value1 === value2) return true;
  if (value1 == null || value2 == null) return false;

  // Handle VARIABLE_ALIAS
  if (value1?.type === 'VARIABLE_ALIAS' && value2?.type === 'VARIABLE_ALIAS') {
    return value1.id === value2.id;
  }

  // Handle color objects (RGBA)
  if (typeof value1 === 'object' && typeof value2 === 'object' && 'r' in value1 && 'r' in value2) {
    // Compare with fixed precision to handle floating-point issues
    const r1 = Number(value1.r.toFixed(2));
    const r2 = Number(value2.r.toFixed(2));
    const g1 = Number(value1.g.toFixed(2));
    const g2 = Number(value2.g.toFixed(2));
    const b1 = Number(value1.b.toFixed(2));
    const b2 = Number(value2.b.toFixed(2));
    const a1 = Number(value1.a.toFixed(2));
    const a2 = Number(value2.a.toFixed(2));

    return r1 === r2 && g1 === g2 && b1 === b2 && a1 === a2;
  }

  // Handle numbers with floating-point precision
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    const v1 = Number(value1.toFixed(2));
    const v2 = Number(value2.toFixed(2));
    return v1 === v2;
  }

  // Handle primitives (strings, etc)
  return value1 === value2;
}

/**
 * Compare two Figma scope arrays for equality, ignoring order.
 *
 * Non-array inputs (e.g. `undefined`) are treated as empty, so a variable with
 * no scopes and a token defining `[]` compare equal.
 *
 * @param {string[]|undefined} scopes1 - First scopes array
 * @param {string[]|undefined} scopes2 - Second scopes array
 * @returns {boolean} True if both contain the same scopes
 */
export function scopesAreEqual(scopes1, scopes2) {
  const first = Array.isArray(scopes1) ? scopes1 : [];
  const second = Array.isArray(scopes2) ? scopes2 : [];

  if (first.length !== second.length) return false;

  const sortedFirst = [...first].sort();
  const sortedSecond = [...second].sort();

  return sortedFirst.every((scope, index) => scope === sortedSecond[index]);
}

/**
 * Parse and fix floating-point precision issues
 * @param {*} value - Value to parse as float
 * @param {string} [context] - Context for error messages
 * @returns {number} Parsed float with precision fixed
 * @throws {Error} If value cannot be parsed as a number
 */
export function parseFloatWithPrecision(value) {
  const parsedValue = parseFloat(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Cannot convert "${value}" to float`);
  }

  return Number(parsedValue.toFixed(2));
}

/**
 * Converts DTCG (Design Token Community Group) color format to Figma's RGBA format
 *
 * @param {Object} $value - DTCG color value object
 * @param {number[]} $value.components - RGB color components array [r, g, b] (0-255 or 0-1)
 * @param {number} [$value.alpha] - Alpha transparency value (0-1), defaults to 1 if not provided
 * @returns {Object} Figma RGBA color object with properties r, g, b, a
 *
 * @example
 * // Convert RGB with explicit alpha
 * DTCGToFigmaColorFormat({
 *   components: [255, 128, 0],
 *   alpha: 0.8
 * });
 * // Returns: { r: 255, g: 128, b: 0, a: 0.8 }
 *
 * @example
 * // Convert RGB without alpha (defaults to 1)
 * DTCGToFigmaColorFormat({
 *   components: [0, 150, 255]
 * });
 * // Returns: { r: 0, g: 150, b: 255, a: 1 }
 */
export function DTCGToFigmaColorFormat($value) {
  if ($value.colorSpace !== 'srgb' || $value.components.length !== 3) {
    throw new Error(
      'sRGB DTCG color components must be an array with exactly 3 elements [r, g, b]',
    );
  }
  const [r, g, b] = $value.components;
  const a = $value.alpha !== undefined ? $value.alpha : 1;
  return { r, g, b, a };
}

/**
 * Convert token value to Figma format based on token type
 * @param {Object} token - Token with $value and $type
 * @returns {*} Converted value
 */
export function convertValue(token) {
  const { $value, $type } = token;

  // Handle colors
  if ($type === 'color' && typeof $value === 'object' && $value.components) {
    return DTCGToFigmaColorFormat($value);
  }

  // Handle dimensions
  if ($type === 'dimension' && typeof $value === 'object' && $value.value !== undefined) {
    return parseFloatWithPrecision($value.value);
  }

  // Handle numbers
  if ($type === 'number') {
    return parseFloatWithPrecision($value);
  }

  // Handle strings
  if ($type === 'string') {
    return String($value);
  }

  // Handle fontWeights
  if ($type === 'fontWeight') {
    if (typeof $value === 'string') {
      return String($value);
    }
    return parseFloatWithPrecision($value);
  }

  return $value;
}

/**
 * Get Figma variable type from token type
 * https://developers.figma.com/docs/rest-api/variables-types/#variable-type
 * @param {string} tokenType - Token type (e.g., 'color', 'dimension')
 * @returns {string} Figma variable type (e.g., 'COLOR', 'FLOAT')
 */
export function getVariableType(tokenType) {
  const FIGMA_TYPE_MAP = {
    color: 'COLOR',
    dimension: 'FLOAT',
    number: 'FLOAT',
    string: 'STRING',
    fontWeight: 'FLOAT',
    lineHeight: 'FLOAT',
    letterSpacing: 'FLOAT',
    opacity: 'FLOAT',
  };
  return FIGMA_TYPE_MAP[tokenType] || 'STRING';
}

/**
 * @param {Object} token - Token with $value and $type
 * @param {Map} allTokens - Map of all available tokens
 * @param {Map} variables - Map of existing Figma variables
 * @param {string} variableName - Name of the variable being resolved
 * @returns {*} Resolved value
 */
// eslint-disable-next-line max-params
export function resolveValue(token, allTokens, variables, variableName = null) {
  const { $value } = token;

  // If value is an alias reference, resolve it
  if (typeof $value === 'string' && $value.startsWith('{') && $value.endsWith('}')) {
    const aliasName = $value.slice(1, -1);

    // Check if the alias target exists as a Figma variable first
    const variable = variables.get(aliasName);
    if (variable) {
      return { type: 'VARIABLE_ALIAS', id: variable.id };
    }

    // If not in Figma, try to resolve from tokens
    const aliasToken = allTokens.get(aliasName);
    if (aliasToken) {
      // Recursively resolve in case the alias points to another alias
      return resolveValue(aliasToken, allTokens, variables, aliasName);
    }

    // Fallback - shouldn't happen
    return $value;
  }

  // Get the actual variable type from Figma
  const variable = variableName ? variables.get(variableName) : null;
  const figmaType = variable?.resolvedType;

  if (figmaType === 'COLOR') {
    if (typeof $value === 'object' && $value.components) {
      return DTCGToFigmaColorFormat($value);
    }
  }

  if (figmaType === 'FLOAT') {
    const isValueObject = typeof $value === 'object' && $value.value !== undefined;
    const rawValue = isValueObject ? $value.value : $value;
    return parseFloatWithPrecision(rawValue);
  }

  if (figmaType === 'STRING') {
    return String($value);
  }

  // Fallback to normal conversion
  return convertValue(token);
}
