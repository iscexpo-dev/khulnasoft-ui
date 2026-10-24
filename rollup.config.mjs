import path from 'node:path';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { glob } from 'glob';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import { string } from 'rollup-plugin-string';
import vue from 'rollup-plugin-vue';

const DIRNAME = path.join(import.meta.dirname, '.');

/**
 * Returns true if an import is not considered for inlining into the current file.
 */
const isExternalModule = (moduleId) => {
  if (
    /*
    SCSS files are considered to be included, because they will be extracted
    later with the help of rollup-plugin-postcss
     */
    moduleId.endsWith('.scss') ||
    /**
     * We want to inline markdown in our documentation, in order to be able to
     * use it directly in Pajamas
     */
    moduleId.endsWith('.md') ||
    /**
     * We want to inline the `<script>` portion of our Vue Single File components
     * Those are added as `modules` with an url like filename:
     * `component.js?rollup-plugin-vue=script.js`
     */
    moduleId.includes('?rollup-plugin-vue=') ||
    /**
     * Our entrypoints should not be considered external
     */
    moduleId.match(/src\/.+\.(js|vue)$/)
  ) {
    return false;
  }

  /**
   * Everything else is an "external module", this means we do not roll up external
   * dependencies ( lodash / ...) or internal imports (e.g. ./button)
   *
   * This allows us to make @khulnasoft/ui treeshakeable.
   */
  return true;
};

const postCssPlugin = ({ useSass = true } = {}) =>
  postcss({
    extract: true,
    minimize: true,
    sourceMap: true,
    ...(useSass
      ? {
          use: [
            [
              'sass',
              {
                includePaths: [
                  path.resolve(DIRNAME, 'node_modules'),
                  path.resolve(DIRNAME, '../../node_modules'),
                ],
              },
            ],
          ],
        }
      : {}),
  });

/**
 * Fixes import files of compiled files
 *
 * @param {String} code Compiled code of the file
 */
const fixImports = (code) => {
  return (
    code
      /**
       * Remove `.vue` from imports, as we are compiling them to JS
       *
       * from './components/base/icon/icon.vue';
       * =>
       * from './components/base/icon/icon';
       */
      .replace(/(from\s+(["']).+?)\.vue(\2)/g, '$1$3')
  );
};

/* eslint-disable-next-line import-x/no-default-export */
export default glob
  .sync('src/**/*.{js,vue}', {
    ignore: ['**/*.spec.js', '**/*.stories.js', 'src/internal/**/*', 'src/vendor/**/*'],
  })
  .concat(
    glob.sync('src/vendor/bootstrap-vue/src/**/*.js', {
      ignore: ['**/*.spec.js', '**/*.stories.js'],
    }),
  )
  .map((input) => {
    const outputFilename = input.replace(/^src\//, '').replace(/\.(vue|js)$/, '');

    return {
      external: isExternalModule,
      input,
      output: {
        format: 'esm',
        file: `dist/${outputFilename}.js`,
      },
      plugins: [
        replace({
          preventAssignment: true,
          delimiters: ['', ''],
          include: 'src/index.js',
          values: {
            '/* auto-inject-styles */': "import './scss/khulnasoft_ui.scss';",
          },
        }),
        postCssPlugin(),
        string({
          include: '**/*.md',
        }),
        vue({
          /**
           * Per default rollup-plugin-vue includes a `.mjs` version of
           * the component normalizer, which doesn't play well with jest
           * For this reason we include the common js version
           */
          normalizer: '~vue-runtime-helpers/dist/normalize-component.js',
        }),
        babel({
          exclude: ['node_modules/!(bootstrap-vue)/**'],
        }),
        resolve(),
        commonjs({
          ignore: ['@gitlab/svgs/dist/icons.json'],
        }),
        {
          name: 'fix-imports',
          generateBundle(options, bundle) {
            Object.keys(bundle).forEach((key) => {
              if (bundle[key].code) {
                // eslint-disable-next-line no-param-reassign
                bundle[key].code = fixImports(bundle[key].code);
              }
            });
          },
        },
      ],
    };
  })
  .concat({
    input: './src/scss/tailwind.css',
    output: {
      file: 'dist/tailwind.css',
    },
    plugins: [postCssPlugin({ useSass: false })],
  });
