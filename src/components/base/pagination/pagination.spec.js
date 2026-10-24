import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { breakpoints } from '~/utils/breakpoints';
import Pagination from './pagination.vue';

jest.useFakeTimers();

const expectClassActive = expect.arrayContaining(['active']);
const mockResizeWidth = (width) => {
  window.innerWidth = width;
  const resizeEvent = document.createEvent('Event');
  resizeEvent.initEvent('resize', true, true);
  window.dispatchEvent(resizeEvent);
  jest.runOnlyPendingTimers();
};

describe('pagination component', () => {
  let wrapper;
  const findPrev = () => wrapper.find('[data-testid="gl-pagination-prev"]');
  const findNext = () => wrapper.find('[data-testid="gl-pagination-next"]');
  const findListItems = () => wrapper.findAll('[data-testid="gl-pagination-li"]');
  const findPaginationItems = () => wrapper.findAll('[data-testid="gl-pagination-item"]');
  const propsData = {
    value: 3,
    perPage: 5,
    totalItems: 30,
  };
  const createComponent = (props = propsData, options = {}) => {
    wrapper = mount(Pagination, {
      propsData: {
        itemsPerPage: 20,
        ...props,
      },
      ...options,
    });
  };

  it('should change pagination limits on resize', () => {
    createComponent();

    mockResizeWidth(breakpoints.sm);
    expect(wrapper.vm.paginationLimit).toBe(0);
    expect(wrapper.vm.maxAdjacentPages).toBe(0);

    mockResizeWidth(breakpoints.md);
    expect(wrapper.vm.paginationLimit).toBe(3);
    expect(wrapper.vm.maxAdjacentPages).toBe(1);

    mockResizeWidth(breakpoints.lg);
    expect(wrapper.vm.paginationLimit).toBe(9);
    expect(wrapper.vm.maxAdjacentPages).toBe(4);

    mockResizeWidth(breakpoints.xl);
    expect(wrapper.vm.paginationLimit).toBe(9);
    expect(wrapper.vm.maxAdjacentPages).toBe(4);
  });

  it('should not render when one page fits all items', async () => {
    createComponent({
      ...propsData,
      totalItems: 5,
    });
    await nextTick();

    expect(wrapper.text()).toBe('');
  });

  it('supports slots customization', () => {
    mockResizeWidth(breakpoints.lg);
    createComponent(
      {
        ...propsData,
        value: 8,
        totalItems: 75,
      },
      {
        slots: {
          previous: '<span>custom_prev_slot</span>',
          next: '<span>custom_next_slot</span>',
          'ellipsis-left': '<span>custom_ellipsis_left_slot</span>',
          'ellipsis-right': '<span>custom_ellipsis_right_slot</span>',
        },
        scopedSlots: {
          'page-number': '<span slot-scope="{ page }">custom_page_number_slot_{{ page }}</span>',
        },
      },
    );
    const items = findPaginationItems();
    expect(findPrev().text()).toBe('custom_prev_slot');
    expect(items.at(0).text()).toBe('custom_page_number_slot_1');
    expect(items.at(1).text()).toBe('custom_ellipsis_left_slot');
    expect(items.at(6).text()).toBe('custom_page_number_slot_8');
    expect(items.at(items.length - 2).text()).toBe('custom_ellipsis_right_slot');
    expect(items.at(items.length - 1).text()).toBe('custom_page_number_slot_15');
    expect(findNext().text()).toBe('custom_next_slot');
  });

  it('sets links href properly in link-based mode', () => {
    createComponent({
      ...propsData,
      linkGen: (page) => `#page${page}`,
    });
    const items = findPaginationItems();
    expect(items.at(0).attributes('href')).toBe('#page1');
  });

  it('emits input event when page changes', () => {
    createComponent({
      ...propsData,
      value: 1,
      totalItems: 75,
    });
    findNext().trigger('click');

    expect(wrapper.emitted('input')).toHaveLength(1);
    expect(wrapper.emitted('input')[0]).toEqual([2]);
  });

  it('emits previous event when previous item is clicked', () => {
    createComponent({
      ...propsData,
      value: 2, // 'previous' is disabled when the value is 1
      totalItems: 75,
    });

    findPrev().trigger('click');

    expect(wrapper.emitted('previous')).toEqual([[]]);
  });

  it('emits next event when next is clicked', () => {
    createComponent({
      ...propsData,
      value: 1,
      totalItems: 75,
    });
    findNext().trigger('click');

    expect(wrapper.emitted('next')).toEqual([[]]);
  });

  it('does not prevent link events in link-based mode', () => {
    createComponent({
      ...propsData,
      linkGen: (page) => `#page${page}`,
    });

    const clickEvent = new MouseEvent('click');
    clickEvent.preventDefault = jest.fn();

    const nextItem = findPaginationItems().at(1);
    nextItem.element.dispatchEvent(clickEvent);

    expect(clickEvent.preventDefault).not.toHaveBeenCalled();
  });

  describe('with a total of 4 pages and 3rd page active', () => {
    beforeEach(() => {
      mockResizeWidth(breakpoints.lg);
      createComponent({
        ...propsData,
        totalItems: 20,
      });
    });

    it('shows 3rd page as active and enables all items', () => {
      const items = findListItems();
      expect(items.at(3).find('a').classes()).toEqual(expectClassActive);
      expect(items.at(3).find('a').attributes('aria-current')).toEqual('page');
      items.wrappers.forEach((item) => {
        expect(item.element.tagName).not.toBe('SPAN');
      });
    });

    it('shows all pages on desktop', () => {
      const items = findListItems();
      expect(items).toHaveLength(6);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe('2');
      expect(items.at(3).text()).toBe('3');
      expect(items.at(4).text()).toBe('4');
      expect(findNext().exists()).toBe(true);
    });

    it('shows all pages mobile', () => {
      mockResizeWidth(breakpoints.sm);
      const items = findListItems();
      expect(items).toHaveLength(6);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe('2');
      expect(items.at(3).text()).toBe('3');
      expect(items.at(4).text()).toBe('4');
      expect(findNext().exists()).toBe(true);
    });
  });

  describe('with a total of 15 pages and first page active', () => {
    beforeEach(() => {
      mockResizeWidth(breakpoints.lg);
      createComponent({
        ...propsData,
        value: 1,
        totalItems: 75,
      });
    });

    it('renders the disabled previous item without href or aria-label', () => {
      expect(findPrev().attributes('href')).toBeUndefined();
      expect(findPrev().attributes('aria-label')).toBeUndefined();
    });

    it('shows 1st page as active and disables previous item', () => {
      const items = findListItems();
      expect(findPrev().element.tagName).toBe('SPAN');
      expect(items.at(1).find('a').classes()).toEqual(expectClassActive);
      expect(items.at(1).find('a').attributes('aria-current')).toEqual('page');
      expect(items.at(items.length - 1).element.tagName).not.toBe('SPAN');

      findPrev().trigger('click');
      expect(wrapper.emitted('previous')).toBeUndefined();
    });

    it('shows first 5 pages and collapses right side on desktop', () => {
      const items = findListItems();
      expect(items).toHaveLength(9);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe('2');
      expect(items.at(3).text()).toBe('3');
      expect(items.at(4).text()).toBe('4');
      expect(items.at(5).text()).toBe('5');
      expect(items.at(6).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(7).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });

    it('shows first 2 pages and collapses right side mobile', async () => {
      mockResizeWidth(breakpoints.sm);

      await nextTick();

      const items = findListItems();
      expect(items).toHaveLength(6);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe('2');
      expect(items.at(3).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(4).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });
  });

  describe('with a total of 15 pages and 8th page active', () => {
    beforeEach(() => {
      mockResizeWidth(breakpoints.lg);
      createComponent({
        ...propsData,
        value: 8,
        totalItems: 75,
      });
    });

    it('shows pages 4 to 12 and collapses both sides on desktop', () => {
      const items = findListItems();
      expect(items).toHaveLength(15);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(3).text()).toBe('4');
      expect(items.at(7).text()).toBe('8');
      expect(items.at(11).text()).toBe('12');
      expect(items.at(12).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(13).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });

    it('shows page 8 and collapses both sides on mobile', async () => {
      mockResizeWidth(breakpoints.sm);

      await nextTick();

      const items = findListItems();
      expect(items).toHaveLength(7);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(3).text()).toBe('8');
      expect(items.at(4).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(5).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });
  });

  describe('with a total of 15 pages and 15th page active', () => {
    beforeEach(() => {
      mockResizeWidth(breakpoints.lg);
      createComponent({
        ...propsData,
        value: 15,
        totalItems: 75,
      });
    });

    it('shows 15th page as active and disables next', () => {
      const items = findListItems();
      expect(findPrev().element.tagName).not.toBe('SPAN');
      expect(items.at(7).find('a').classes()).toEqual(expectClassActive);
      expect(items.at(7).find('a').attributes('aria-current')).toEqual('page');
      expect(findNext().element.tagName).toBe('SPAN');

      findNext().trigger('click');
      expect(wrapper.emitted('next')).toBeUndefined();
    });

    it('shows pages 11 to 15 and collapses left side on desktop', () => {
      const items = findListItems();
      expect(items).toHaveLength(9);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(3).text()).toBe('11');
      expect(items.at(4).text()).toBe('12');
      expect(items.at(5).text()).toBe('13');
      expect(items.at(6).text()).toBe('14');
      expect(items.at(7).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });

    it('shows pages 14 to 15 and collapses left side on mobile', async () => {
      mockResizeWidth(breakpoints.sm);

      await nextTick();

      const items = findListItems();
      expect(items).toHaveLength(6);
      expect(findPrev().exists()).toBe(true);
      expect(items.at(1).text()).toBe('1');
      expect(items.at(2).text()).toBe(wrapper.vm.ellipsisText);
      expect(items.at(3).text()).toBe('14');
      expect(items.at(4).text()).toBe('15');
      expect(findNext().exists()).toBe(true);
    });
  });

  describe('compact navigation', () => {
    const compactPropsData = {
      ...propsData,
      totalItems: 0,
    };

    it.each`
      props                           | description
      ${{ prevPage: 2 }}              | ${'is a previous page'}
      ${{ nextPage: 2 }}              | ${'is a next page'}
      ${{ prevPage: 2, nextPage: 4 }} | ${'are previous and next pages'}
    `(
      `renders only prev & nexts when totalItems isn's provided and there $description`,
      ({ props }) => {
        createComponent({
          ...compactPropsData,
          ...props,
        });
        const items = findListItems();
        expect(items).toHaveLength(2);
      },
    );

    it('disables prev when on first page', () => {
      createComponent({
        ...compactPropsData,
        value: 1,
        nextPage: 2,
      });
      const prevListItem = findListItems().at(0);
      expect(prevListItem.attributes('aria-hidden')).toBe('true');
      const prevItem = findPrev();
      expect(prevItem.element.tagName).toBe('SPAN');
      expect(prevItem.attributes('href')).toBeUndefined();
      expect(prevItem.attributes('aria-label')).toBeUndefined();
    });

    it('disables next when on last page', () => {
      createComponent({
        ...compactPropsData,
        value: 2,
        prevPage: 1,
      });
      const nextListItem = findListItems().at(1);
      expect(nextListItem.attributes('aria-hidden')).toBe('true');
      const nextItem = findNext();
      expect(nextItem.element.tagName).toBe('SPAN');
      expect(nextItem.attributes('href')).toBeUndefined();
      expect(nextItem.attributes('aria-label')).toBeUndefined();
    });
  });
});
