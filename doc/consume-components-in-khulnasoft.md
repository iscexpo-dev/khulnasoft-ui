# Consume components in KhulnaSoft

KhulnaSoft UI provides a set of reusable components to be consumed in KhulnaSoft to follow design guidelines
and ensure consistency.

## Getting started

When integrating a component into KhulnaSoft's code base, it's good to start by listing all the files
where the previous implementation needs to be replaced by the KhulnaSoft UI component. These files can
then be grouped into 3 categories: Vue components, Vanilla JS and Haml templates. It's also good to
make a list of pages or areas where this component will be utilized, to go through regular
regression testing during the development process.

## Vue components

This is the most straightforward aspect of integrating KhulnaSoft UI components. Components should be
consumed as Vue components in existing Vue files, as described in stories documented in
the KhulnaSoft UI storybook. This should be the first step because the rendered result of a component
will inform how to integrate it in the next steps.

### Troubleshooting tips

#### Picking up issues & using the GDK to test

Some components that need to be migrated live in areas of the app that require a special GDK setup
to test. Designers/engineers may have these special setups already configured based on their stage
work requirements. If you work in an area that requires a special setup, you are encouraged to
tackle the components that live in those areas. Otherwise, start with issues that do not need
a special setup.

#### Finding the right file

It can sometimes be difficult to find the right file by using the tree view in your editor.
Instead, if you are using Visual Studio Code, you can use `Cmd` + `P` to open the search box.
When the prompt appears, type the name of the file.

#### Finding a component in the UI

When opening your MR, you will want to provide before and after screenshots. To do this, you will
need to find the component you are migrating in the UI using GDK or a review app.

##### Using component text

To find the component you are migrating in the UI, search for the text used within that component.

For example, in the following instance the button text is `New file`.

```vue
<gl-button
  variant="success"
  category="primary"
  :title="__('New file')"
  :aria-label="__('New file')"
  data-testid="first_file_button"
  @click="createNewFile()"
>
  {{ __('New file') }}
</gl-button>
```

##### Using surrounding code & file name

You can also determine where a component lives by looking at the code that lives above and below the
component you are migrating. For example, in `app/assets/javascripts/ide/components/ide.vue`,
the button being migrated is below text that reads:

> Create a new file as there are no files yet. Afterwards, you'll be able to commit your changes.

If you look at the code, you can see that this UI is referring to an empty state because it lives
in `<div class="row js-empty-state">`.

You can also use the file name to help determine the area of the app to look in. In this case,
`ide` is referring to the Web IDE.

To find the component, find an empty state in the Web IDE with the above text and a button
that reads `New file`.

## Vanilla JS

Sometimes, a component is rendered in plain Javascript. It's not common and should be avoided.
If this use case is encountered during integration, migrating it to Vue is the best option.
If that's not possible, then the previous step should be used to check how the component is
rendered. The proper HTML tag and all CSS classes should be used to render the component as
intended. Inline styles might be required, though they should be avoided as much as possible.

## Pure Haml template

If a Haml template does not get any data from Javascript, then the Vue component cannot be used.
In that case, and if the component is simple enough (e.g. buttons, inputs, labels), it's good to
look at how it's currently rendered in the previous use cases to use the proper HTML tag and copy
over all the proper classes for it to render properly. If the component was previously rendered
using a utility or Ruby helper function, then this function should be updated to reflect the
necessary changes to its look and feel. If the component is too complex to use the first method,
then a helper function should be written for it. An example is the helper function for labels
(app/helpers/labels_helper.rb in KhulnaSoft project).
