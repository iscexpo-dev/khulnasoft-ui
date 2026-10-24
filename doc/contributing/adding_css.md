# Adding CSS

## Please read this first

As of KhulnaSoft 16.9, we are in the process of migrating our CSS utilities library to [Tailwind CSS](https://tailwindcss.com/).
We will be updating this document as the migration progresses. For the time being, existing CSS
utilities can still be used. However, when a Tailwind CSS equivalent is available, please consider
using it instead.

Read more about this migration in the [blueprint](https://handbook.khulnasoft.com/handbook/engineering/architecture/design-documents/tailwindcss/).

## Writing components styles

KhulnaSoft UI components are primarily styled with "component styles", meaning that each component
generally has its own stylesheet and uses a limited number of CSS selectors. This approach makes it
relatively trivial for consumers to re-implement some components in languages other than Vue, and
to inherit from KhulnaSoft UI's styles by applying a few high-level CSS classes.

Tailwind CSS utilities can also be used within components when they present a clear advantage over
component styles. For example, toggling an element's visibility is better done by adding or removing
a CSS utility rather than adding specific CSS classes and implementing the behavior in the
component's stylesheet.

When writing component styles, you may use Tailwind's `@apply` directive to apply any style definitions
Tailwind CSS supports.

`@apply` lets you write component styles the same way you apply CSS utilities as the naming is the same.
Additionally, [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
reports any conflicting styles, letting you spot superfluous `@apply`s that might make your intention
harder to understand.

Each component's stylesheet should contain its "modularized" style:

```scss
// src/components/base/button/button.scss

.gl-button {
  // style
  @apply gl-border-0 gl-py-3 gl-px-4;
}
```

When the component is integrated
into the application, you should still follow the
[`utility-first`](https://docs.khulnasoft.com/development/fe_guide/style/scss/#utility-classes)
approach for basic layout and other styles.

See [`GlToken`'s stylesheet](https://github.com/khulnasoft/khulnasoft-ui/-/blob/main/src/components/base/token/token.scss)
for an example of how we use utility mixins in KhulnaSoft UI.

Some components styles still need to be migrated from KhulnaSoft into KhulnaSoft UI, keep track of the
progress in the epic: [&1590](https://khulnasoft.com/groups/khulnasoft-org/-/epics/1590).

### Why are we doing it like this?

The current SCSS architecture was designed to allow us both to gain the advantages of a utility CSS
approach while also applying the same styles to both Vue components here in KhulnaSoft UI and ViewComponent
components in KhulnaSoft itself.

```scss

.gl-my-component {
  display: flex;
  @apply gl-text-red-800;
}

..

<my-component class='gl-my-component' />
```

The advantages of this approach are:

- It clarifies which colors, sizes, and other options are available within the
[design system](https://design.khulnasoft.com/). Rather than pulling values from specs or guessing,
engineers are able to use already-vetted values. This also means that adding a new value becomes
more deliberate and easier to check in reviews.

- It makes it easier to cascade design-system changes, especially around text and spacing. That is
because the utilities lend themselves to being updatable, like variables, in just one place
(the Tailwind CSS preset).
Consider the case of spacing: the values are taken from a scale (`gl-spacing-0`, `gl-spacing-10`),
which means updating from a base of `4px` to `6px` means updating just those utilities but keeping the
relations the same.

We've decided to build component classes from the Tailwind CSS utilities in order to
get these benefits while also having component CSS that can be applied in KhulnaSoft UI and KhulnaSoft
itself, `Vue` and `ViewComponent`, without undue or repeated effort.

### Architecture history

- In 2019, we decided to start building out a CSS utility mixins library that would be compiled to
  a CSS utilities library, but would also be leveraged to write component styles using the `@extend`
  directive. Read more about those decisions in RFCs [#2](https://khulnasoft.com/khulnasoft-org/frontend/rfcs/issues/2)
  and [#4](https://khulnasoft.com/khulnasoft-org/frontend/rfcs/issues/4).
- Shortly after approving [RFC #4](https://khulnasoft.com/khulnasoft-org/frontend/rfcs/issues/4), we noticed
  how it caused the CSS to grow uncontrollably. We [decided](https://github.com/khulnasoft/khulnasoft-ui/-/merge_requests/623#note_192269009)
  to switch to `@include`, which kept the CSS growth under control.
- In 2022, we started using `ViewComponent` to re-implement KhulnaSoft UI components in Ruby in KhulnaSoft.
  This improved upon our previous approach that relied more heavily on HAML templating. [Learn more
  about how we use `ViewComponent`](https://docs.khulnasoft.com/ee/development/fe_guide/view_component.html).
- Still in 2022, we created [RFC #107](https://khulnasoft.com/khulnasoft-org/frontend/rfcs/-/issues/107) to
  propose a switch from our custom-built CSS utilities library to Tailwind CSS. We had noticed many
  flaws with the way we were building out our utils library, which could be alleviated for the most
  part by switching to a well-established open source tool.
- In 2024, we started migrating away from our custom CSS utils in favor of Tailwind CSS.

For more information about utility-first CSS, consider [a post from Mike Crittenden](https://critter.blog/2018/06/08/in-defense-of-functional-css/),
[Ollie Williams on CSS Tricks](https://css-tricks.com/growing-popularity-atomic-css/) or
[Sarah Dayan's Frontstuff](https://frontstuff.io/in-defense-of-utility-first-css).

## Other Style Questions

More answers and details can be found in the [SCSS style guide](https://docs.khulnasoft.com/development/fe_guide/style/scss/).
