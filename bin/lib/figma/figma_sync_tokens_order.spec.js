import {
  extractExistingOrder,
  mergeVariableOrder,
  generateOrderedVariableIds,
} from './figma_sync_tokens_order.mjs';

describe('Sync Tokens Order', () => {
  describe('extractExistingOrder', () => {
    it('should extract variable names in order from collection', () => {
      const collection = {
        id: 'col-1',
        variableIds: ['var-1', 'var-2', 'var-3'],
      };

      const variables = new Map([
        ['text-color-default', { id: 'var-1', name: 'text-color-default' }],
        ['background-color-default', { id: 'var-2', name: 'background-color-default' }],
        ['border-color-default', { id: 'var-3', name: 'border-color-default' }],
      ]);

      const order = extractExistingOrder(collection, variables);

      expect(order).toEqual([
        'text-color-default',
        'background-color-default',
        'border-color-default',
      ]);
    });

    it('should return empty array for collection with no variables', () => {
      const collection = {
        id: 'col-1',
        variableIds: [],
      };

      const variables = new Map();
      const order = extractExistingOrder(collection, variables);

      expect(order).toEqual([]);
    });

    it('should skip variables that are not found', () => {
      const collection = {
        id: 'col-1',
        variableIds: ['var-1', 'var-missing', 'var-2'],
      };

      const variables = new Map([
        ['text-color-default', { id: 'var-1', name: 'text-color-default' }],
        ['border-color-default', { id: 'var-2', name: 'border-color-default' }],
      ]);

      const order = extractExistingOrder(collection, variables);

      expect(order).toEqual(['text-color-default', 'border-color-default']);
    });
  });

  describe('mergeVariableOrder', () => {
    it('should append new variables to existing order', () => {
      const existingOrder = ['text-color-default', 'background-color-default'];
      const newVariables = ['border-color-default', 'icon-color-default'];

      const merged = mergeVariableOrder(existingOrder, newVariables);

      expect(merged).toEqual([
        'text-color-default',
        'background-color-default',
        'border-color-default',
        'icon-color-default',
      ]);
    });

    it('should not duplicate existing variables', () => {
      const existingOrder = ['text-color-default', 'background-color-default'];
      const newVariables = ['background-color-default', 'border-color-default'];

      const merged = mergeVariableOrder(existingOrder, newVariables);

      expect(merged).toEqual([
        'text-color-default',
        'background-color-default',
        'border-color-default',
      ]);
    });

    it('should preserve insertion order of new variables', () => {
      const existingOrder = ['text-color-default'];
      const newVariables = ['button-background', 'icon-color-muted', 'background-color-default'];

      const merged = mergeVariableOrder(existingOrder, newVariables);

      expect(merged).toEqual([
        'text-color-default',
        'button-background',
        'icon-color-muted',
        'background-color-default',
      ]);
    });

    it('should return existing order when no new variables', () => {
      const existingOrder = ['text-color-default', 'background-color-default'];
      const newVariables = [];

      const merged = mergeVariableOrder(existingOrder, newVariables);

      expect(merged).toEqual(existingOrder);
    });
  });

  describe('generateOrderedVariableIds', () => {
    it('should generate variable IDs in specified order', () => {
      const orderedNames = [
        'text-color-default',
        'background-color-default',
        'border-color-default',
      ];

      const variables = new Map([
        ['text-color-default', { id: 'var-1', name: 'text-color-default' }],
        ['background-color-default', { id: 'var-2', name: 'background-color-default' }],
        ['border-color-default', { id: 'var-3', name: 'border-color-default' }],
      ]);

      const ids = generateOrderedVariableIds(orderedNames, variables);

      expect(ids).toEqual(['var-1', 'var-2', 'var-3']);
    });

    it('should skip variables that do not exist', () => {
      const orderedNames = ['text-color-default', 'missing-variable', 'border-color-default'];

      const variables = new Map([
        ['text-color-default', { id: 'var-1', name: 'text-color-default' }],
        ['border-color-default', { id: 'var-3', name: 'border-color-default' }],
      ]);

      const ids = generateOrderedVariableIds(orderedNames, variables);

      expect(ids).toEqual(['var-1', 'var-3']);
    });

    it('should handle empty order array', () => {
      const variables = new Map([
        ['text-color-default', { id: 'var-1', name: 'text-color-default' }],
      ]);

      const ids = generateOrderedVariableIds([], variables);

      expect(ids).toEqual([]);
    });
  });
});
