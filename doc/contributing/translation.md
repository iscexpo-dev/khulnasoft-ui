# Making labels translatable

> This page covers the authoring side: how to mark a component's labels as
> translatable. For how consumers supply translations to `@khulnasoft/ui`, see
> [Internationalization](https://design.khulnasoft.com/contribute/internationalization).

Some components need to render text content. For example, a search input component might require a
placeholder. In those cases, it's important for text content to be exposed via a public API so
consumers can override and translate them as needed.

KhulnaSoft UI provides a way to set default translations at configuration time for all labels marked
as translatable, as well as a way to override individual labels contextually. This requires a bit of
setup:

* All labels need to be exposed as component props to provide contextual overrides.
  Composite components need to re-expose their children label props so overrides
  can be passed down the components tree.
* Prop default values should leverage the `translate` or `translatePlural` utility to extract generic
  translations from configuration.

Here's how a translatable component might look like:

```html
<script>
import { translate, translatePlural } from '../../../utils/i18n';

export default {
  name: 'GlBar',
  props: {
    // Expose the label via the component's props so that the consumer can override it contextually.
    ariaLabel: {
      type: String,
      required: false,
      // Always fallback on the configuration's generic translation for when no override is needed.
      default: translate('GlBar.ariaLabel', 'Default ARIA label'),
    },
    // Some labels have parameters that can be printed using sprintf.
    parameterizedLabel: {
      type: String,
      required: false,
      default: translate('GlBar.parameterizedLabel', 'This is a %{parameter}'),
    },
    // Pluralization is also supported using the `translatePlural` helper.
    // In this case, the value is a Function that receives the number as its only argument.
    pluralizedLabel: {
      type: Function,
      required: false,
      default: translatePlural('GlBar.pluralizedLabel', '%d result', '%d results'),
    },
  }
};
</script>

<template>
  <button :aria-label="ariaLabel"></button>
</template>
```

A composite component that leverages the above primitive component might then look like this:

```html
<script>
import { translate } from '../../../utils/i18n';

export default {
  name: 'GlFoo',
  components: { GlBar },
  props: {
    // Re-expose the child component's label prop to preserve the ability to override it contextually.
    barAriaLabel: {
      type: String,
      required: false,
      // The composite component can define its own generic translation if needed.
      default: () => translate('GlFoo.GlBar.ariaLabel', 'Default ARIA label'),
    }
  }
};
</script>

<template>
  <gl-bar :aria-label="barAriaLabel" />
</template>
```

## The `translate` helper

The `translate` helper is what we use to flag translatable labels. It accepts two parameters:

1. The translation key. A string representing the label's ID which the consumer needs to provide
   when setting generic translations. As a general guideline, translation keys should start with the
   component's name, followed by a dot and the child component's name if applicable, followed by a
   dot and a camelCased string describing the label being externalized.
   E.g. `GlParentComponent[.GlChildComponent].externalizedLabel`.
   Translation keys should not change unless absolutely necessary. If one needs to be changed,
   consumers would need to update their configuration to ensure existing translations are still
   bound to the corresponding translation keys. Changing a translation key should be considered a
   breaking change.
2. The default, US English label. This can be relied upon if the consumer does not have translation
   capabilities, in which case it might be simpler not to explicitly setup generic translations at
   configuration time. _Do not_ rely on this if the consumer is internationalized as you might end
   up with untranslated labels scattered across the app. In development, KhulnaSoft UI warns about
   missing generic translations to make this caveat more visible.

## The `translatePlural` helper

The `translatePlural` helper is similar to `translate` but is used to mark pluralizable labels for
translation. This ones accepts the parameters:

1. The translation key.
2. The default, US English singular label.
3. The default, US English plural label.

`translatePlural` returns a function that receives a number as its only argument. The argument can
be used to pick between the singular and plural label. By default, the singular label is picked if
the argument is `1`. Otherwise, the plural label is used.

> **Note:** This default applies English plural rules only. In many languages, the `one` plural
> category is not equivalent to the number 1. In French, 0 uses `one`. In Ukrainian,
> any number ending in 1 except 11 uses `one`, so 21, 31, 41 all trigger the singular form.
> A component using `translatePlural` without a consumer override will fall back to the
> English two-form rule, which produces incorrect plural forms for those languages.

To support all languages correctly, consumers must override the label via `setConfigs`
using `n__()`, which follows [Unicode CLDR plural rules](https://cldr.unicode.org/index/cldr-spec/plural-rules):

```js
'GlBar.pluralizedLabel': (n) => n__('%d result', '%d results', n),
```

Avoid hardcoding a number in the singular label. If you need a natural singular form
without a number, handle the exact count of 1 as a separate string rather than placing it
in the `one` slot.

```js
(n) => (n === 1 ? s__('Component|1 result') : n__('%d result', '%d results', n))
```

Both labels can print the argument by including the `%d` placeholder.

## Setting generic translations

Generic translations must be provided at configuration time:

```js
setConfigs({
  translations: {
    'GlBar.ariaLabel': __('GlBar generic ARIA label'),
    'GlBar.parameterizedLabel': __('GlBar generic %{parameter}'),
    'GlBar.pluralizedLabel': (n) => n__('merge request', 'merge requests', n),
  },
});
```

From there, any instance of `GlBar` will leverage this generic translation, unless it is being
overridden contextually.

## Override translations contextually

To override a component label's translations in a specific context, provide the corresponding prop:

```html
<gl-bar :aria-label="__('Custom ARIA label for GlBar')" />
<gl-foo :bar-aria-label="__('Custom ARIA label for GlBar in GlFoo')" />
```

## Building the translations dictionary

KhulnaSoft UI keeps tracks of translatable labels via the `translations.js` dictionary. When adding
new translatable labels, make sure they are included in the dictionary by running
`yarn translations:collect`, then commit the changes.
If you have `lefthook` enabled, this is done automatically in the `pre-commit` hook.
