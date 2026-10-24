# Frequently asked questions

## Does KhulnaSoft UI work with Vue 3?

It works with `@vue/compat`, yes. See the [Develop page](https://design.khulnasoft.com/get-started/develop).

It will be [a while](https://khulnasoft.com/groups/khulnasoft-org/-/epics/6252) before
KhulnaSoft UI runs with the main Vue 3 build.

## What icons library do we use in KhulnaSoft UI?

KhulnaSoft has its own SVG icons library, explore it here: <https://design.khulnasoft.com/product-foundations/iconography-directory/>

## How can I import icons from KhulnaSoft SVGs into KhulnaSoft UI components?

In most circumstances, you can utilize the [icon](https://design.khulnasoft.com/storybook?path=/story/base-icon--default)
component to render an SVG from the khulnasoft-svgs library. ECharts components, however,
cannot use SVG sprite references and require the entire `path` content to be
passed in via config options. For now, we are hard-coding these in [svg_paths.js](src/utils/svgs/svg_paths.js),
but this will soon be done at build-time through a utility method.

## Some KhulnaSoft UI components are not conforming to [Pajamas Design System](https://design.khulnasoft.com/) can I still use them?

Some [Pajamas Design System](https://design.khulnasoft.com/) components implemented
in KhulnaSoft UI do not conform with the design system specs because they lack some
planned features or are not correctly styled yet. In the Pajamas website, a banner
on top of the component examples indicates that:

> This component does not yet conform to the correct styling defined in our Design
System. Refer to the Design System documentation when referencing visuals for this
component.

For example, at the time of writing, this type of warning can be observed for
[all form components](https://design.khulnasoft.com/components/forms). It, however,
doesn’t imply that the component should not be used.

KhulnaSoft always asks to use `<gl-*>` components whenever a suitable component exists.
It makes codebase unified and more comfortable to maintain/refactor in the future.

Ensure a [Product Designer](https://about.khulnasoft.com/company/team/?department=ux-department)
reviews the use of the non-conforming component as part of the MR review. Make a
follow up issue and attach it to the component implementation epic found within
the [Components of Pajamas Design System epic](https://khulnasoft.com/groups/khulnasoft-org/-/epics/973).

## I want to write tests cases for invalid uses of my component but they always fail, what's going on?

An example of that would be when you want to make sure that invalid props are handled properly
(i.e. you defined a custom validator and you want to make sure it errors out when the prop
doesn't pass the validation). In this kind of situation, Vue will log an error to the console,
which is forbidden by our global assertion in [Jest's setup](tests/jest_setup.js). To make your
test pass, make sure you reset `console.error()`'s mock at then of your test:

```js
it('should log an error', () => {
  // test you component

  global.console.error.mockReset();
});
```

## How do I run Storybook/Cypress tests on a different host/port?

Set the `STORYBOOK_HOST` and `STORYBOOK_PORT` environment variables.

## Does KhulnaSoft UI have a changelog/version history?

Yes! Changelogs can be found in the [releases
page](https://github.com/khulnasoft/khulnasoft-ui/-/releases) or in the
[CHANGELOG.md](./CHANGELOG.md) file.

## I've added some files to KhulnaSoft UI but they aren't published in the npm package, why is that?

The files that we want published are listed in the [`files`](https://docs.npmjs.com/files/package.json#files)
field in the `package.json`. You might need to add your files to the field if its path isn't covered
by the current setup.

## Why are we wrapping Bootstrap Vue components?

Wrapping the components is an implementation of the [adapter design pattern](https://en.wikipedia.org/wiki/Adapter_pattern).
We do this so that we can easily switch out Bootstrap Vue for another library (if we need to) and
also to encapsulate the logic used for setting the styles/CSS class names. Developers should be able
to easily import KhulnaSoft UI without worrying about the internal logic and styling setup.

## Why did we decide to go for Rollup instead of Webpack?

While Webpack and Rollup have similar purposes, Webpack tends to work best when building applications,
while Rollup works better for building libraries.

For context, Sean Larkin (maintainer of Webpack) mentioned this on this [twitter thread](https://twitter.com/TheLarkInn/status/849792234002063360).
