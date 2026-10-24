# Theme ramps

khulnasoft-ui ships a default neutral scale and five tinted variants
(`indigo`, `blue`, `green`, `red`, `gray`). All six ramps are derived from
a single contrast spec by `bin/generate_theme_ramps.mjs`, so every theme
shares the same perceptual structure.

## Design

`bin/lib/theme_ramps.mjs` declares two constants that are the source of
truth for every neutral ramp:

- `TARGET_RATIOS`: 14 WCAG2 contrast targets (one per neutral step,
  measured against `#ffffff`). Frozen and intentionally **not** derived
  from `color.tokens.json`; the tokens file is downstream of this spec.
- `THEME_KEY_COLORS`: multiple hex anchors per theme (for example near-white, mid,
  near-black). [Adobe Leonardo][leonardo] interpolates through them in
  `OKLCH` to find hex values that hit each target ratio.

A third constant, `TINTED_RATIO_OVERRIDES`, replaces individual steps'
ratios for the tinted themes only. It lifts tinted `neutral-1000` off
near-black while the default ramp (and `ui-neutral`) keeps the frozen spec.

The script never writes to disk. It prints six SCSS blocks to stdout; the
operator pastes them into the appropriate files (see
[Regenerating](#regenerating)).

### Theme overrides

`src/scss/themes.scss` ends with hand-maintained overrides that give a few
nav item tokens each tinted theme's hue: `--gl-nav-item-selected-indicator-color`,
`--gl-nav-item-foreground-color-default`, and
`--gl-nav-item-foreground-color-hover`. Each tinted theme has two blocks:

- A light block, `:root.ui-<theme>, .ui-<theme>-scope`.
- A dark block, `:root.ui-<theme>.gl-dark, .ui-<theme>-scope.gl-dark-scope`,
  which sets the same properties to their dark-mode steps.

The dark block needs the extra class because the dark tokens are scoped to
`:root.gl-dark`, which ties with `:root.ui-<theme>` on specificity. The
generator doesn't produce these blocks, so don't replace or remove them when
you paste in regenerated ramps.

## When to regenerate

- Adding a new theme.
- Tuning the character of an existing theme (changing key colors).
- Changing `TARGET_RATIOS`, `TINTED_RATIO_OVERRIDES`, or `COLOR_SPACE`.

The script is utility-only. It does not run on `make tokens`, `prebuild`,
or `pretest`.

## Regenerating

```sh
yarn generate-theme-ramps
```

The output looks like:

```scss
:root {
  --gl-color-neutral-0: #fff;
  /* ... */
}

:root.ui-indigo {
  /* ... */
}

/* one tinted block per theme */
```

1. From the **first block** (`:root { ... }`), copy and convert each step's hex into the correct
   format for `src/tokens/constant/color.neutral.tokens.json` under
   `color.neutral.<step>.$value.hex`.
2. Run `make tokens` to regenerate `src/tokens/build/**`.
3. In `src/scss/themes.scss`, replace the declarations in each tinted
   theme's ramp block with those from the **remaining five blocks**
   (`:root.ui-<theme> { ... }`). Keep the `.ui-<theme>-scope` selectors
   and the hand-maintained `ui-neutral` block. Don't replace the
   [theme overrides](#theme-overrides) at the end of the file.
4. Run `yarn test:visual:update` and review the snapshot diff.

## Adding a theme

1. Add an entry to `THEME_KEY_COLORS` in `bin/lib/theme_ramps.mjs`:

   ```js
   purple: ['#e0d6e8', '#777777', '#3a2058'],
   ```

2. Add the theme to the `themes` array in `src/utils/constants.js`:

   ```js
   { class: 'ui-purple', value: 'purple', title: 'Purple' }
   ```

3. Run `yarn generate-theme-ramps` and paste the new
   `:root.ui-purple { ... }` block into `src/scss/themes.scss`, then add
   the theme's overrides at the end of the file.

4. Run `yarn test:visual:update`.

The CSS class is derived as `ui-${themeValue}`; theme value
and class must match this convention.

## Caveats

- **Alpha ramps** (`--gl-color-alpha-dark-*`, `--gl-color-alpha-light-*`)
  do not shift with themes today. They are baked at build time as literal
  `rgba(...)` values in `src/tokens/build/css/tokens.css`.
- `TARGET_RATIOS` is **frozen**. Editing it is a breaking change to the
  default neutral scale; expect downstream visual snapshot churn.

[leonardo]: https://github.com/adobe/leonardo
