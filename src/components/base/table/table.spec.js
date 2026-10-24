import { nextTick } from 'vue';
import { shallowMount, mount } from '@vue/test-utils';
import { BTable } from '../../../vendor/bootstrap-vue/src/components/table/table';
import { logWarning } from '../../../utils/utils';
import { waitForAnimationFrame } from '../../../utils/test_utils';
import { glTableLiteWarning } from './constants';
import Table from './table.vue';

jest.mock('../../../utils/utils', () => ({
  isDev: () => true,
  logWarning: jest.fn(),
}));

describe('GlTable', () => {
  let wrapper;

  const slotsTemplate = {
    empty: `
      <p>Placeholder empty text</p>`,
  };

  const factory = ({ mountFn = shallowMount, props = {}, scopedSlots = {} } = {}) => {
    wrapper = mountFn(Table, {
      scopedSlots,
      propsData: props,
    });
  };

  const findBTable = () => wrapper.findComponent(BTable);
  const findColHeaderAt = (index) => findBTable().find('thead').findAll('th').at(index);
  const findFirstColHeader = () => findColHeaderAt(0);
  const findSortIconForHeaderAt = (index) =>
    findColHeaderAt(index).find('[data-testid="sort-icon"]');

  afterEach(() => {
    logWarning.mockClear();
  });

  it('should log a warning when not given any props or slots which qualifies for the usage of GlTable', async () => {
    factory();
    await waitForAnimationFrame();

    expect(logWarning).toHaveBeenCalledWith(glTableLiteWarning, {
      name: 'GlTable',
      element: wrapper.element,
    });
  });

  it('should not log a warning when given a prop which qualifies for the usage of GlTable', async () => {
    factory({ props: { busy: true } });
    await waitForAnimationFrame();

    expect(logWarning).not.toHaveBeenCalled();
  });

  it('should not log a warning when given a slot which qualifies for the usage of GlTable', async () => {
    factory({ scopedSlots: slotsTemplate });
    await waitForAnimationFrame();

    expect(logWarning).not.toHaveBeenCalled();
  });

  it('adds gl-table class to tableClass prop', () => {
    factory({ props: { tableClass: 'test-class' } });

    expect(findBTable().props().tableClass).toEqual(['gl-table', 'test-class', null]);
  });

  it('adds sticky header class to tableClass prop', () => {
    factory({ props: { stickyHeader: true } });

    expect(findBTable().props().tableClass).toEqual([
      'gl-table',
      undefined,
      'gl-table--sticky-header',
    ]);
  });

  it('adds gl-table fields to table prop', () => {
    const fields = ['name', 'age'];

    factory({ props: { fields } });

    expect(wrapper.props('fields')).toEqual(fields);
    expect(findBTable().props('fields')).toEqual(fields);
  });

  describe('sortable columns', () => {
    const fields = [
      {
        key: 'name',
        label: 'Name column',
        sortable: true,
      },
      {
        key: 'age',
        label: 'Age column',
        sortable: true,
      },
      {
        key: 'email',
        label: 'Email column',
        sortable: false,
      },
    ];

    describe('without custom slots', () => {
      beforeEach(() => {
        factory({ mountFn: mount, props: { fields } });
      });

      it('sets the correct column label', () => {
        expect(findFirstColHeader().text()).toMatch(fields[0].label);
      });

      it('renders the ascending sort icon', async () => {
        findFirstColHeader().trigger('click');
        await nextTick();

        const headerText = findFirstColHeader().text();

        expect(headerText).toContain('↑');
      });

      it('renders the descending sort icon', async () => {
        findFirstColHeader().trigger('click');
        findFirstColHeader().trigger('click');
        await nextTick();
        const headerText = findFirstColHeader().text();

        expect(headerText).toContain('↓');
      });

      it('sets initial sorting column using the sortBy property', () => {
        factory({ mountFn: mount, props: { fields, sortBy: 'age' } });

        expect(findSortIconForHeaderAt(0).classes()).toContain('gl-hidden');
        expect(findSortIconForHeaderAt(1).classes()).not.toContain('gl-hidden');
      });

      it('sets initial sorting direction using the sortDesc property', () => {
        factory({
          mountFn: mount,
          props: { fields, sortBy: 'age', sortDesc: true },
        });

        expect(findColHeaderAt(1).text()).toContain('↓');
      });

      it('does not render sort icon for non-sortable columns', () => {
        expect(findSortIconForHeaderAt(2).exists()).toBe(false);
      });

      describe('changing the active sort column', () => {
        it('hides sorting icon in previous active sort column', async () => {
          await findColHeaderAt(0).trigger('click');

          expect(findSortIconForHeaderAt(0).classes()).not.toContain('gl-hidden');
          expect(findSortIconForHeaderAt(1).classes()).toContain('gl-hidden');

          await findColHeaderAt(1).trigger('click');

          expect(findSortIconForHeaderAt(0).classes()).toContain('gl-hidden');
          expect(findSortIconForHeaderAt(1).classes()).not.toContain('gl-hidden');
        });
      });
    });

    describe('when headers are customized via slots', () => {
      const customSlotContent = 'customSlotContent';

      beforeEach(() => {
        factory({
          mountFn: mount,
          props: {
            fields,
          },
          scopedSlots: {
            'head(name)': `<div>${customSlotContent}</div>`,
          },
        });
      });

      it('renders the ascending sort icon alongside the custom slot content', async () => {
        findFirstColHeader().trigger('click');
        await nextTick();

        const headerText = findFirstColHeader().text();

        expect(headerText).toContain('↑');
        expect(headerText).toContain(customSlotContent);
      });
    });
  });

  describe("headers' alignment", () => {
    it('does not add the `.gl-table-th-align-right` class by default', () => {
      const fields = ['name'];
      factory({ mountFn: mount, props: { fields } });

      expect(findFirstColHeader().classes()).not.toContain('gl-table-th-align-right');
    });

    it('adds the `.gl-table-th-align-right` class if `thAlignRight` is `true`', () => {
      const fields = [
        {
          key: 'name',
          thAlignRight: true,
        },
      ];
      factory({ mountFn: mount, props: { fields } });

      expect(findFirstColHeader().classes()).toContain('gl-table-th-align-right');
    });

    it.each([['foo', 'bar'], 'foo bar'])(
      'merges the `.gl-table-th-align-right` class with `thClass`',
      (thClass) => {
        const fields = [
          {
            key: 'name',
            thAlignRight: true,
            thClass,
          },
        ];
        factory({ mountFn: mount, props: { fields } });

        expect(findFirstColHeader().classes()).toStrictEqual([
          'foo',
          'bar',
          'gl-table-th-align-right',
        ]);
      },
    );
  });
});
