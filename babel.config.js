module.exports = (api) => {
  // base config for rollup
  const babelPresetEnv = ['@babel/preset-env', { modules: false }];
  const config = {
    presets: [babelPresetEnv],
    plugins: [
      // See: https://github.com/khulnasoft/khulnasoft/-/issues/336216
      '@babel/plugin-proposal-optional-chaining',
      // See: https://github.com/khulnasoft/khulnasoft/-/issues/336216
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
  };

  // storybook and visual regression tests
  if (api.env('storybook')) {
    babelPresetEnv[1] = { targets: { esmodules: true } };
    config.presets.push('@babel/preset-react');
  }

  // jest tests
  if (api.env('test')) {
    // tests are run in a node environment, not a browser
    babelPresetEnv[1] = { targets: { node: 'current' } };
  }

  return config;
};
