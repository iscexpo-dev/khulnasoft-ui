import { shallowMount } from '@vue/test-utils';
import Intersperse from './intersperse.vue';

describe('Intersperse Component', () => {
  let wrapper;

  const createComponent = (defaultSlot = [], options = {}) => {
    wrapper = shallowMount(Intersperse, {
      slots: {
        default: defaultSlot,
      },
      ...options,
    });
  };

  it.each`
    defaultSlotContent                             | selectorsToCheck
    ${'<button>Foo</button>'}                      | ${['button']}
    ${'<a><span>Foo</span></a><small>Bar</small>'} | ${['a', 'a span', 'small']}
  `(
    'contains all elements passed into the default slot',
    ({ defaultSlotContent, selectorsToCheck }) => {
      createComponent(defaultSlotContent);

      selectorsToCheck.forEach((selector) => {
        // eslint-disable-next-line unicorn/no-array-callback-reference
        expect(wrapper.find(selector).exists()).toBe(true);
      });
    },
  );

  it('renders an empty span if no children are given', () => {
    createComponent([]);

    expect(wrapper.find('span').exists()).toBe(true);
    expect(wrapper.findAll('span > *')).toHaveLength(0);
  });

  it('uses ", " as a default separator and lastSeparator', () => {
    const defaultSlotContent = '<i>Foo</i><i>Bar</i><i>Baz</i>';
    const expectedText = 'Foo, Bar, Baz';

    createComponent(defaultSlotContent);

    expect(wrapper.text()).toBe(expectedText);
  });

  it('adds class attribute when present', () => {
    const defaultSlotContent = '<i>Foo</i><i>Bar</i>';

    createComponent(defaultSlotContent, { attrs: { class: 'text-secondary' } });

    expect(wrapper.classes('text-secondary')).toBe(true);
  });

  it.each`
    defaultSlotContent                     | separator | expectedText
    ${'<i>Baz</i><i>Foo</i><i>Biz</i>'}    | ${', '}   | ${'Baz, Foo, Biz'}
    ${'<i>Bar</i><i>Baz</i><i>Biz</i>'}    | ${'+'}    | ${'Bar+Baz+Biz'}
    ${'<i>Bar</i><i>Baz</i><i>Biz</i>Quz'} | ${'-'}    | ${'Bar-Baz-Biz-Quz'}
  `(
    'intersperses each direct child with a given separator',
    ({ defaultSlotContent, separator, expectedText }) => {
      createComponent(defaultSlotContent, { propsData: { separator } });

      expect(wrapper.text()).toBe(expectedText);
    },
  );

  it.each`
    defaultSlotContent                  | separator | lastSeparator | expectedText
    ${'<i>Foo</i><i>Bar</i>'}           | ${','}    | ${' and '}    | ${'Foo and Bar'}
    ${'<i>Foo</i><i>Bar</i><i>Baz</i>'} | ${','}    | ${'+'}        | ${'Foo,Bar,+Baz'}
    ${'<i>Foo</i><i>Bar</i><i>Baz</i>'} | ${','}    | ${' and '}    | ${'Foo,Bar, and Baz'}
    ${'<i>Foo</i><i>Bar</i><i>Baz</i>'} | ${'+'}    | ${' and '}    | ${'Foo+Bar+ and Baz'}
  `(
    'adds a custom lastSeparator',
    ({ defaultSlotContent, separator, lastSeparator, expectedText }) => {
      createComponent(defaultSlotContent, { propsData: { separator, lastSeparator } });

      expect(wrapper.text()).toBe(expectedText);
    },
  );

  it.each`
    defaultSlotContent
    ${'<i>Foo</i>\n<i>Bar</i>'}
    ${'<i>Foo</i>\t<i>Bar</i>'}
    ${'<i>Foo</i>    <i>Bar</i>'}
    ${'<i>Foo</i>&nbsp;<i>Bar</i>'}
    ${'<i>Foo</i><i>Bar</i>  '}
    ${'<i>Foo</i><i>Bar</i>\n'}
  `(
    'strips whitespace and empty elements that are direct children "$defaultSlotContent"',
    ({ defaultSlotContent }) => {
      createComponent(defaultSlotContent);

      expect(wrapper.text()).toBe('Foo, Bar');
    },
  );

  it.each`
    defaultSlotContent                                                                          | expectedText
    ${'<i>Foo</i><!-- comment --><i>Bar</i>'}                                                   | ${'Foo, Bar'}
    ${'<i>Foo</i><i v-if="false">Nop</i><i>Bar</i>\n'}                                          | ${'Foo, Bar'}
    ${`<i v-for="s in ['Foo', 'Bar', 'Baz']">{{ s }}</i>\n`}                                    | ${'Foo, Bar, Baz'}
    ${`<i v-for="s in ['Foo', 'Bar']">{{ s }}</i><i v-for="s in ['Baz', 'Qaz']">{{ s }}</i>\n`} | ${'Foo, Bar, Baz, Qaz'}
  `(
    'strips comments and elements with directives that are direct children "$defaultSlotContent"',
    ({ defaultSlotContent, expectedText }) => {
      createComponent(defaultSlotContent);

      expect(wrapper.text()).toBe(expectedText);
    },
  );

  it.each`
    defaultSlotContent                                  | expectedText
    ${'<i>Foo Bar</i><i>Baz</i>'}                       | ${'Foo Bar, Baz'}
    ${'<i>Foo Bar</i><i>Baz Qaz</i><small>Qiz</small>'} | ${'Foo Bar, Baz Qaz, Qiz'}
  `(
    'preserves whitespace elements that are not direct children of the slot',
    ({ defaultSlotContent, expectedText }) => {
      createComponent(defaultSlotContent);

      expect(wrapper.text()).toBe(expectedText);
    },
  );
});
