import { syncConstants, syncMode } from './figma_sync_tokens_collections.mjs';

describe('Sync Tokens Collections', () => {
  describe('syncConstants', () => {
    let mockClient;
    let tokens;

    beforeEach(() => {
      tokens = new Map([
        ['color-red', { $value: '#ff0000', $type: 'color' }],
        ['spacing-1', { $value: { value: 8 }, $type: 'dimension' }],
      ]);

      mockClient = {
        getCollection: jest.fn(() => ({
          id: 'col-1',
          name: 'Constants',
          modes: [{ modeId: 'mode-1', name: 'value' }],
          variableIds: ['var-1'],
        })),
        getVariable: jest.fn((name) => {
          if (name === 'color-red') {
            return {
              id: 'var-1',
              name: 'color-red',
              resolvedType: 'COLOR',
              variableCollectionId: 'col-1',
            };
          }
          return undefined;
        }),
        batchRequest: jest.fn(async () => 0),
        fetchVariables: jest.fn(async () => {}),
        reorderCollection: jest.fn(async () => {}),
        variables: new Map([
          [
            'color-red',
            {
              id: 'var-1',
              name: 'color-red',
              resolvedType: 'COLOR',
              variableCollectionId: 'col-1',
            },
          ],
        ]),
      };
    });

    it('should create and sync constants', async () => {
      const result = await syncConstants(mockClient, tokens);

      expect(mockClient.getCollection).toHaveBeenCalledWith('Constants');
      expect(mockClient.batchRequest).toHaveBeenCalled();
      expect(result.variablesCreated).toBeGreaterThan(0);
    });

    it('should handle empty token map', async () => {
      const emptyTokens = new Map();

      const result = await syncConstants(mockClient, emptyTokens);

      expect(result.variablesCreated).toBe(0);
    });

    it('updates scopes on an existing variable when they differ', async () => {
      const scopedTokens = new Map([
        [
          'color-red',
          {
            $value: '#ff0000',
            $type: 'color',
            $extensions: { 'com.figma.scopes': ['SHAPE_FILL', 'FRAME_FILL'] },
          },
        ],
      ]);
      mockClient.getVariable = jest.fn((name) =>
        name === 'color-red'
          ? {
              id: 'var-1',
              name: 'color-red',
              resolvedType: 'COLOR',
              variableCollectionId: 'col-1',
              scopes: ['SHAPE_FILL'],
            }
          : undefined,
      );

      const result = await syncConstants(mockClient, scopedTokens);

      expect(mockClient.batchRequest).toHaveBeenCalledWith(
        [{ action: 'UPDATE', id: 'var-1', scopes: ['SHAPE_FILL', 'FRAME_FILL'] }],
        'variables',
      );
      expect(result.variablesCreated).toBe(0);
      expect(result.variablesUpdated).toBe(1);
    });

    it('does not update scopes on an existing variable when they already match', async () => {
      const scopedTokens = new Map([
        [
          'color-red',
          {
            $value: '#ff0000',
            $type: 'color',
            $extensions: { 'com.figma.scopes': ['SHAPE_FILL'] },
          },
        ],
      ]);
      mockClient.getVariable = jest.fn((name) =>
        name === 'color-red'
          ? {
              id: 'var-1',
              name: 'color-red',
              resolvedType: 'COLOR',
              variableCollectionId: 'col-1',
              // Same as the token, just a different order.
              scopes: ['SHAPE_FILL'],
            }
          : undefined,
      );

      await syncConstants(mockClient, scopedTokens);

      // The `variables` endpoint is only used for creates and scope updates;
      // neither should happen here.
      expect(mockClient.batchRequest).not.toHaveBeenCalledWith(expect.anything(), 'variables');
    });
  });

  describe('syncMode', () => {
    let mockClient;
    let lightTokens;
    let darkTokens;

    beforeEach(() => {
      lightTokens = new Map([['text-color', { $value: '#000000', $type: 'color' }]]);

      darkTokens = new Map([['text-color', { $value: '#ffffff', $type: 'color' }]]);

      mockClient = {
        getCollection: jest.fn(() => ({
          id: 'col-2',
          name: 'Mode',
          modes: [
            { modeId: 'mode-light', name: 'default' },
            { modeId: 'mode-dark', name: 'dark' },
          ],
          variableIds: [],
        })),
        getVariable: jest.fn(() => undefined),
        batchRequest: jest.fn(async () => 0),
        fetchVariables: jest.fn(async () => {}),
        reorderCollection: jest.fn(async () => {}),
        variables: new Map(),
      };
    });

    it('should sync light and dark mode tokens', async () => {
      const result = await syncMode(mockClient, lightTokens, darkTokens);

      expect(mockClient.getCollection).toHaveBeenCalledWith('Mode');
      expect(mockClient.batchRequest).toHaveBeenCalled();
      expect(result.variablesCreated).toBeGreaterThan(0);
    });

    it('should throw error if modes are missing', async () => {
      mockClient.getCollection.mockReturnValueOnce({
        id: 'col-2',
        name: 'Mode',
        modes: [{ modeId: 'mode-light', name: 'default' }],
        variableIds: [],
      });

      await expect(syncMode(mockClient, lightTokens, darkTokens)).rejects.toThrow(
        'Mode collection must have "default" and "dark" modes',
      );
    });

    it('updates scopes on an existing variable when they differ', async () => {
      const scopedLightTokens = new Map([
        [
          'text-color',
          {
            $value: '#000000',
            $type: 'color',
            $extensions: { 'com.figma.scopes': ['SHAPE_FILL', 'FRAME_FILL'] },
          },
        ],
      ]);
      const scopedDarkTokens = new Map([
        [
          'text-color',
          {
            $value: '#ffffff',
            $type: 'color',
            $extensions: { 'com.figma.scopes': ['SHAPE_FILL', 'FRAME_FILL'] },
          },
        ],
      ]);
      mockClient.getVariable = jest.fn((name) =>
        name === 'text-color'
          ? {
              id: 'var-1',
              name: 'text-color',
              resolvedType: 'COLOR',
              variableCollectionId: 'col-2',
              scopes: ['SHAPE_FILL'],
            }
          : undefined,
      );

      const result = await syncMode(mockClient, scopedLightTokens, scopedDarkTokens);

      expect(mockClient.batchRequest).toHaveBeenCalledWith(
        [{ action: 'UPDATE', id: 'var-1', scopes: ['SHAPE_FILL', 'FRAME_FILL'] }],
        'variables',
      );
      expect(result.variablesCreated).toBe(0);
      expect(result.variablesUpdated).toBe(1);
    });

    it('should handle union of light and dark tokens', async () => {
      const extendedDarkTokens = new Map([
        ['text-color', { $value: '#ffffff', $type: 'color' }],
        ['bg-color', { $value: '#1a1a1a', $type: 'color' }],
      ]);

      mockClient.getVariable.mockReturnValueOnce(undefined);
      mockClient.getVariable.mockReturnValueOnce(undefined);

      await syncMode(mockClient, lightTokens, extendedDarkTokens);

      // Should create variables for both light and dark tokens
      expect(mockClient.batchRequest).toHaveBeenCalled();
    });
  });
});
