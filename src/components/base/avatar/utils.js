import { isNumber } from 'lodash-es';
import { avatarSizeOptions } from '../../../utils/constants';

export const avatarSizeValidator = (value) => {
  const sizes = isNumber(value) ? [value] : Object.values(value);

  const areValidSizes = sizes.every((size) => {
    const isValidSize = avatarSizeOptions.includes(size);

    if (!isValidSize) {
      /* eslint-disable-next-line no-console */
      console.error(`Avatar size should be one of [${avatarSizeOptions}], received: ${size}`);
    }

    return isValidSize;
  });

  return areValidSizes;
};
