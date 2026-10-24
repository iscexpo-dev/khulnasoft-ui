const BATCH_SIZE = 100;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

/**
 * Normalize the scopes Figma reports for a variable.
 *
 * Figma accepts `FONT_WEIGHT` when writing scopes for a `FLOAT` variable but
 * reads it back as `FONT_STYLE`, which the REST spec documents as valid for
 * `STRING` variables only. Without this, font weight variables never compare
 * equal to their token definition and re-sync their scopes on every run.
 *
 * @param {Object} variable - Variable as returned by the Figma REST API
 * @returns {string[]|undefined} Scopes with the FLOAT font weight alias resolved
 */
function normalizeScopes({ resolvedType, scopes }) {
  if (resolvedType !== 'FLOAT' || !Array.isArray(scopes)) return scopes;

  return scopes.map((scope) => (scope === 'FONT_STYLE' ? 'FONT_WEIGHT' : scope));
}

export class FigmaClient {
  constructor(token, fileId) {
    this.token = token;
    this.fileId = fileId;
    this.collections = new Map();
    this.variables = new Map();
  }

  /**
   * Make a request to the Figma API
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body
   * @returns {Promise<Object>} Response data
   */
  async request(method, endpoint, body = null) {
    const url = `${FIGMA_API_BASE}${endpoint}`;
    const options = {
      method,
      headers: {
        'X-Figma-Token': this.token,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Figma API (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Fetch existing variables from Figma
   * @returns {Promise<Object>} Collections and variables
   */
  async fetchVariables() {
    console.log('Fetching existing variables...');
    const response = await this.request('GET', `/files/${this.fileId}/variables/local`);

    const meta = response.meta || {};
    const collections = Object.values(meta.variableCollections || {});
    const variables = Object.values(meta.variables || {});

    collections.forEach((col) => {
      this.collections.set(col.name, col);
    });

    variables.forEach((v) => {
      this.variables.set(v.name, { ...v, scopes: normalizeScopes(v) });
    });

    console.log(`Found ${variables.length} variables in ${collections.length} collections`);
    return { collections, variables };
  }

  /**
   * Send requests in batches to avoid API limits
   * @param {Array} items - Items to send
   * @param {string} endpoint - Endpoint type ('variables' or 'variableModeValues')
   * @param {number} batchSize - Size of each batch
   * @returns {Promise<number>} Number of items processed
   */
  async batchRequest(items, endpoint, batchSize = BATCH_SIZE) {
    let processed = 0;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);

      console.log(`  Batch ${batchNum}/${totalBatches}...`);

      try {
        const body =
          endpoint === 'variables' ? { variables: batch } : { variableModeValues: batch };

        // Both endpoints use /variables
        // eslint-disable-next-line no-await-in-loop
        await this.request('POST', `/files/${this.fileId}/variables`, body);
        processed += batch.length;
      } catch (error) {
        console.error(`  Batch ${batchNum} failed:`, error.message);
        throw error;
      }

      // Small delay between batches
      if (i + batchSize < items.length) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
    }
    return processed;
  }

  /**
   * Get a collection by name
   * @param {string} name - Collection name
   * @returns {Object} Collection object
   */
  getCollection(name) {
    const collection = this.collections.get(name);
    if (!collection) {
      throw new Error(`Collection "${name}" not found`);
    }
    return collection;
  }

  /**
   * Get a variable by name
   * @param {string} name - Variable name
   * @returns {Object|undefined} Variable object
   */
  getVariable(name) {
    return this.variables.get(name);
  }

  /**
   * Reorder variables in a collection
   * @param {string} collectionId - Collection ID
   * @param {string[]} variableIds - Variable IDs in desired order
   * @returns {Promise<Object>} Response data
   */
  async reorderCollection(collectionId, variableIds) {
    console.log(`Reordering ${variableIds.length} variables in collection...`);

    const operation = {
      action: 'UPDATE',
      id: collectionId,
      variableIds,
    };

    return this.request('POST', `/files/${this.fileId}/variables`, {
      variableCollections: [operation],
    });
  }
}
