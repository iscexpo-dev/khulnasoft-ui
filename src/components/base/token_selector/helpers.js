import { has } from 'lodash-es';

export const tokensValidator = (tokens) => tokens.every((token) => has(token, 'id'));
