/**
 * Return a story decorator function, which wraps the given story in a `div`
 * element with the given `style` attributes.
 *
 * @param {object} style The style attribute to apply to the container.
 * @return {function} The story decorator.
 */
export const makeContainer =
  (style, tag = 'div') =>
  (Story) => ({
    render(h) {
      return h(tag, { style }, [h(Story())]);
    },
  });
