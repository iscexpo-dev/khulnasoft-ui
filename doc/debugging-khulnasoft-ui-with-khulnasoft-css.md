# How KhulnaSoft UI interacts with KhulnaSoft

- We do not import KhulnaSoft UI variables directly into KhulnaSoft. KhulnaSoft
  UI variables are only available to KhulnaSoft UI components through their
  definitions in the KhulnaSoft UI.
- In KhulnaSoft, if a CSS class relies on KhulnaSoft variables and it is applied to a
  non-KhulnaSoft UI component, KhulnaSoft variables determine what we see.
- In KhulnaSoft, if a KhulnaSoft UI component is used and we don't apply any other CSS,
  KhulnaSoft UI variables determine what we see through the classes that use them,
  because we import the component classes into the framework.
- In KhulnaSoft, if a CSS class relies on variables *and* is applied to
  a KhulnaSoft UI component, we must determine which class is more specific.
  When this happens, every specific KhulnaSoft component stylesheet loads
  later, and overwrites KhulnaSoft UI with its specificity. This is often when we
  need to use [`!important` classes](https://github.com/khulnasoft/khulnasoft-ui/-/blob/main/doc/css.md#utility-class-specifity).
- In KhulnaSoft, you can use utility classes as a way to use KhulnaSoft UI styles. You
  can also run into specificity issues here, as KhulnaSoft may have more-targeted classes.
  Using the
  [`!important` classes](https://github.com/khulnasoft/khulnasoft-ui/-/blob/main/doc/css.md#utility-class-specifity)
  can help solve this problem.
