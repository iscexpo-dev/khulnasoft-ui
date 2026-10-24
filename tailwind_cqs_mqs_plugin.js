const plugin = require('tailwindcss/plugin');

const tailwindCQsMQsPlugin = (buildCQs = false) =>
  plugin(
    ({ matchUtilities, matchVariant, theme }) => {
      const values = theme('containers') ?? {};

      function parseValue(value) {
        const numericValue = value.match(/^(\d+\.\d+|\d+|\.\d+)\D+/)?.[1] ?? null;
        if (numericValue === null) return null;

        return parseFloat(value);
      }

      matchUtilities(
        {
          '@container': (value, { modifier }) => {
            return {
              'container-type': value,
              'container-name': modifier,
            };
          },
        },
        {
          values: {
            DEFAULT: 'inline-size',
            normal: 'normal',
          },
          modifiers: 'any',
        },
      );

      const buildVariantMatcher = (variant, { cqBuilder, mqBuilder }) => [
        variant,
        (value = '', { modifier }) => {
          const parsed = parseValue(value);

          if (parsed === null) return [];

          return buildCQs ? cqBuilder(modifier, value) : mqBuilder(value);
        },
        {
          values,
          sort(aVariant, zVariant) {
            const a = parseFloat(aVariant.value);
            const z = parseFloat(zVariant.value);

            if (a === null || z === null) return 0;

            // Sort values themselves regardless of unit
            if (a - z !== 0) return a - z;

            const aLabel = aVariant.modifier ?? '';
            const zLabel = zVariant.modifier ?? '';

            // Explicitly move empty labels to the end
            if (aLabel === '' && zLabel !== '') {
              return 1;
            }
            if (aLabel !== '' && zLabel === '') {
              return -1;
            }

            // Sort labels alphabetically in the English locale
            // We are intentionally overriding the locale because we do not want the sort to
            // be affected by the machine's locale (be it a developer or CI environment)
            return aLabel.localeCompare(zLabel, 'en', { numeric: true });
          },
        },
      ];

      matchVariant(
        ...buildVariantMatcher('@', {
          cqBuilder: (modifier, value) => `@container ${modifier ?? ''} (min-width: ${value})`,
          mqBuilder: (value) => `@media (min-width: ${value})`,
        }),
      );

      matchVariant(
        ...buildVariantMatcher('@max', {
          cqBuilder: (modifier, value) => `@container ${modifier ?? ''} (width < ${value})`,
          mqBuilder: (value) => `@media (width < ${value})`,
        }),
      );
    },
    {
      theme: {
        containers: {
          sm: '576px',
          md: '768px',
          lg: '992px',
          xl: '1200px',
        },
      },
    },
  );

module.exports = { tailwindCQsMQsPlugin };
