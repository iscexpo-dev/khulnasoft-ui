/**
 * Extract the order of existing variables from a Figma collection
 * @param {Object} collection - Figma collection object
 * @param {Map} variables - Map of all Figma variables
 * @returns {string[]} Array of variable names in their current order
 */
export function extractExistingOrder(collection, variables) {
  if (!collection.variableIds || collection.variableIds.length === 0) {
    return [];
  }

  const orderedNames = [];

  collection.variableIds.forEach((varId) => {
    // Find the variable by ID
    const variable = variables.values().find((v) => v.id === varId);
    if (variable) {
      orderedNames.push(variable.name);
    }
  });

  return orderedNames;
}

/**
 * Merge existing order with new variables
 * @param {string[]} existingOrder - Current order of variables in Figma
 * @param {string[]} newVariables - Names of new variables to add
 * @returns {string[]} Combined order with new variables appended
 */
export function mergeVariableOrder(existingOrder, newVariables) {
  // Filter out variables that already exist
  const uniqueNewVariables = new Set(newVariables).difference(new Set(existingOrder));

  if (uniqueNewVariables.size === 0) {
    return existingOrder;
  }

  // Append new variables to the end
  return [...existingOrder, ...uniqueNewVariables];
}

/**
 * Generate variable IDs in the desired order for a collection update
 * @param {string[]} orderedNames - Variable names in desired order
 * @param {Map} variables - Map of all Figma variables
 * @returns {string[]} Array of variable IDs in the specified order
 */
export function generateOrderedVariableIds(orderedNames, variables) {
  const orderedIds = [];

  orderedNames.forEach((name) => {
    const variable = variables.get(name);
    if (variable) {
      orderedIds.push(variable.id);
    }
  });

  return orderedIds;
}
