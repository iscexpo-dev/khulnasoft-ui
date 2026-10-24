import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createMockDirective, getBinding } from '~helpers/vue_mock_directive';
import GlTruncate from '~/components/utilities/truncate/truncate.vue';
import { badgeVariantToIconVariantMap } from '../../../utils/constants';
import GlAnimatedNumber from '../../utilities/animated_number/animated_number.vue';
import GlBadge from '../../base/badge/badge.vue';
import GlSingleStat from './single_stat.vue';

const title = 'Singe stat title';
const value = '100';
const unit = '%';
const titleIcon = 'hourglass';
const titleIconClass = 'title-icon-class';
const metaIcon = 'heart';
const metaText = 'Success';
const metaTooltip = '20% faster than last month';
const variant = 'info';

describe('GlSingleStat', () => {
  let wrapper;

  const createWrapper = ({ props = {}, slots = {} } = {}) => {
    wrapper = shallowMount(GlSingleStat, {
      propsData: {
        title,
        value,
        ...props,
      },
      directives: {
        GlTooltip: createMockDirective('gl-tooltip'),
      },
      slots,
    });
  };

  const findItemByTestId = (testId) => wrapper.find(`[data-testid="${testId}"]`);
  const findAnimatedNumber = () => wrapper.findComponent(GlAnimatedNumber);
  const findMetaIcon = () => findItemByTestId('meta-icon');
  const findMetaBadge = () => wrapper.findComponent(GlBadge);
  const findMetaBadgeButton = () => findItemByTestId('meta-badge-button');
  const findDescription = () => wrapper.findComponent(GlTruncate);

  describe('displays the correct default data', () => {
    beforeEach(() => createWrapper());

    describe.each`
      element                 | testId                  | shouldDisplay | expected
      ${'metric value'}       | ${'displayValue'}       | ${true}       | ${value}
      ${'non animated value'} | ${'non-animated-value'} | ${true}       | ${value}
      ${'metric title'}       | ${'title-text'}         | ${true}       | ${title}
      ${'metric value units'} | ${'unit'}               | ${false}      | ${null}
      ${'metric title icon'}  | ${'title-icon'}         | ${false}      | ${null}
      ${'meta icon'}          | ${'meta-icon'}          | ${false}      | ${null}
      ${'meta badge'}         | ${'meta-badge'}         | ${false}      | ${null}
      ${'description'}        | ${'description'}        | ${false}      | ${null}
    `('for the $element', ({ shouldDisplay, testId, expected, element }) => {
      it(`${shouldDisplay ? 'displays' : "doesn't display"} the ${element}`, () => {
        const el = findItemByTestId(testId);

        expect(el.exists()).toBe(shouldDisplay);

        if (shouldDisplay) expect(el.text()).toBe(expected);
      });
    });
  });

  describe('shouldAnimate', () => {
    it.each`
      propValue | shouldUseAnimatedComponent
      ${'abc'}  | ${false}
      ${'123'}  | ${true}
    `(
      'renders the correct display type for $propValue',
      ({ propValue, shouldUseAnimatedComponent }) => {
        createWrapper({ props: { value: propValue, shouldAnimate: true } });

        const el = findAnimatedNumber();
        expect(el.exists()).toBe(shouldUseAnimatedComponent);
      },
    );

    describe('units visibility', () => {
      it.each`
        display    | event          | expected
        ${'hides'} | ${'animating'} | ${true}
        ${'shows'} | ${'animated'}  | ${false}
      `('$display the units when $event', async ({ event, expected }) => {
        createWrapper({ props: { unit, shouldAnimate: true } });

        findAnimatedNumber().vm.$emit(event);

        await nextTick();

        expect(findItemByTestId('unit').classes('!gl-opacity-0')).toBe(expected);
      });
    });
  });

  describe('optional data', () => {
    describe('meta information', () => {
      describe('with only a meta icon specified', () => {
        beforeEach(() => createWrapper({ props: { metaIcon } }));

        it('displays a standalone icon', () => {
          const el = findMetaIcon();

          expect(el.exists()).toBe(true);
          expect(el.props('name')).toBe(metaIcon);
          expect(el.props('variant')).toBe(badgeVariantToIconVariantMap.neutral);
        });

        it('does not display a badge', () => {
          expect(findMetaBadge().exists()).toBe(false);
        });
      });

      it.each`
        badgeVariant | iconVariant
        ${'neutral'} | ${'default'}
        ${'info'}    | ${'info'}
        ${'success'} | ${'success'}
        ${'warning'} | ${'warning'}
        ${'danger'}  | ${'danger'}
        ${'tier'}    | ${'default'}
      `(
        'applies the $iconVariant icon variant for the $badgeVariant badge variant',
        ({ badgeVariant, iconVariant }) => {
          createWrapper({ props: { metaIcon, variant: badgeVariant } });

          expect(findMetaIcon().props('variant')).toBe(iconVariant);
        },
      );

      describe.each`
        scenario                                          | mockData
        ${'with only meta text specified'}                | ${{ metaText }}
        ${'with meta text and variant specified'}         | ${{ metaText, variant }}
        ${'with a meta icon and text specified'}          | ${{ metaIcon, metaText }}
        ${'with a meta icon, text and variant specified'} | ${{ metaIcon, metaText, variant }}
      `('$scenario', ({ mockData }) => {
        beforeEach(() => createWrapper({ props: { ...mockData } }));

        it("doesn't display a standalone icon", () => {
          expect(findMetaIcon().exists()).toBe(false);
        });

        it('displays a badge', () => {
          const badge = findMetaBadge();
          const iconSpecified = Object.keys(mockData).includes('metaIcon');
          const variantSpecified = Object.keys(mockData).includes('variant');

          expect(badge.exists()).toBe(true);
          expect(badge.text()).toBe(metaText);
          expect(badge.props('icon')).toBe(iconSpecified ? metaIcon : null);
          expect(badge.props('variant')).toBe(variantSpecified ? variant : 'neutral');
        });

        it('does not render a button wrapper', () => {
          expect(findMetaBadgeButton().exists()).toBe(false);
        });
      });

      describe('with metaTooltip specified', () => {
        beforeEach(() => createWrapper({ props: { metaText, metaIcon, metaTooltip } }));

        it('renders the badge inside the button with correct props and text', () => {
          const badge = findMetaBadgeButton().findComponent(GlBadge);

          expect(badge.text()).toBe(metaText);
          expect(badge.props('icon')).toBe(metaIcon);
          expect(badge.props('variant')).toBe('neutral');
        });

        it('binds the tooltip directive with the correct title', () => {
          const binding = getBinding(findMetaBadgeButton().element, 'gl-tooltip');

          expect(binding).toBeDefined();
          expect(findMetaBadgeButton().attributes('title')).toBe(metaTooltip);
        });
      });
    });

    describe.each`
      element                 | testId          | mockData
      ${'metric value units'} | ${'unit'}       | ${{ unit }}
      ${'metric title icon'}  | ${'title-icon'} | ${{ titleIcon }}
    `('$element', ({ testId, mockData }) => {
      beforeEach(() => createWrapper({ props: { ...mockData } }));

      it('displays when specified', () => {
        const el = findItemByTestId(testId);

        expect(el.exists()).toBe(true);
      });
    });

    describe('`titleIconClass` Prop', () => {
      it.each`
        classes
        ${titleIconClass}
        ${[titleIconClass]}
        ${{ [titleIconClass]: true }}
      `(
        'correctly adds classes to title icon when `titleIconClass` prop is $classes',
        ({ classes }) => {
          createWrapper({
            props: {
              titleIcon,
              titleIconClass: classes,
            },
          });

          expect(findItemByTestId('title-icon').classes()).toEqual(
            expect.arrayContaining(['title-icon-class']),
          );
        },
      );
    });

    describe.each([true, false])(`when the \`useDelimiters\` prop is %s`, (useDelimiters) => {
      const initialValue = '100000.12';

      it('should render the value as expected when not animated', () => {
        createWrapper({
          props: {
            value: initialValue,
            shouldAnimate: false,
            useDelimiters,
          },
        });

        const displayValue = useDelimiters ? '100,000.12' : initialValue;

        expect(findItemByTestId('non-animated-value').text()).toBe(displayValue);
      });

      it('should pass the value and delimiter setting to `GlAnimatedNumber`', () => {
        createWrapper({
          props: {
            value: initialValue,
            shouldAnimate: true,
            animationDecimalPlaces: 2,
            useDelimiters,
          },
        });

        expect(findAnimatedNumber().props()).toMatchObject({
          number: Number(initialValue),
          decimalPlaces: 2,
          useDelimiters,
        });
      });

      it('should keep all the decimal points defined by the value', () => {
        const decimalValue = '100000.000';

        createWrapper({
          props: {
            value: decimalValue,
            shouldAnimate: false,
            useDelimiters,
          },
        });

        const displayValue = useDelimiters ? '100,000.000' : decimalValue;

        expect(findItemByTestId('non-animated-value').text()).toBe(displayValue);
      });
    });

    describe('default slot', () => {
      beforeEach(() => {
        createWrapper({
          slots: {
            default: 'Slot content',
          },
        });
      });

      it('renders slot content', () => {
        expect(wrapper.text()).toContain('Slot content');
      });
    });

    describe('`description` prop', () => {
      beforeEach(() => {
        createWrapper({ props: { description: 'This is a description' } });
      });

      it('displays a description', () => {
        expect(findDescription().props('text')).toBe('This is a description');
      });
    });
  });
});
