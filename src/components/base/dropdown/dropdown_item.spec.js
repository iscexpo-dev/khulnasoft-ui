import { shallowMount } from '@vue/test-utils';
import { BDropdownItem } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-item';
import { BDropdownItemButton } from '../../../vendor/bootstrap-vue/src/components/dropdown/dropdown-item-button';

import GlDropdownItem from './dropdown_item.vue';

describe('dropdown item', () => {
  let wrapper;

  const buildWrapper = (propsData) => {
    wrapper = shallowMount(GlDropdownItem, {
      propsData,
    });
  };

  const findCheckbox = () => wrapper.find('[data-testid="dropdown-item-checkbox"]');

  describe('checkbox', () => {
    it.each`
      props                                       | shouldExist
      ${{ isCheckItem: false, isChecked: false }} | ${false}
      ${{ isCheckItem: true, isChecked: false }}  | ${true}
      ${{ isCheckItem: false, isChecked: true }}  | ${true}
    `('with props $props, renders checkbox=$shouldExist', ({ props, shouldExist }) => {
      buildWrapper(props);

      expect(findCheckbox().exists()).toBe(shouldExist);
    });

    it.each`
      props                                           | expectedClasses
      ${{ isChecked: false, isCheckCentered: false }} | ${['gl-invisible', 'gl-mt-3', 'gl-self-start']}
      ${{ isChecked: true, isCheckCentered: false }}  | ${['gl-mt-3', 'gl-self-start']}
      ${{ isChecked: false, isCheckCentered: true }}  | ${['gl-invisible']}
      ${{ isChecked: true, isCheckCentered: true }}   | ${[]}
    `(
      'with isCheckItem and props=$props, then classes include $expectedClasses',
      ({ props, expectedClasses }) => {
        buildWrapper({
          isCheckItem: true,
          ...props,
        });

        expect(findCheckbox().classes()).toEqual([
          'gl-dropdown-item-check-icon',
          ...expectedClasses,
        ]);
      },
    );
  });

  describe('dynamic component rendering', () => {
    it('with no "href" or "to" attrs, renders a button', () => {
      buildWrapper();
      expect(wrapper.findComponent(BDropdownItemButton).exists()).toBe(true);
    });

    it('with "href" attr, renders an item', () => {
      buildWrapper({ href: '/home' });
      expect(wrapper.findComponent(BDropdownItem).exists()).toBe(true);
    });

    it('with "to" attr, renders an item', () => {
      buildWrapper({ to: { path: 'home' } });
      expect(wrapper.findComponent(BDropdownItem).exists()).toBe(true);
    });
  });
});
