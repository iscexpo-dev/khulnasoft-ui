import { shallowMount } from '@vue/test-utils';
import { BTableLite } from '../../../vendor/bootstrap-vue/src/components/table/table-lite';
import GlTableLite from './table_lite.vue';

describe('GlTableLite', () => {
  let wrapper;

  const factory = (propsData) => {
    wrapper = shallowMount(GlTableLite, {
      propsData,
    });
  };

  const findBTableLite = () => wrapper.findComponent(BTableLite);

  it('adds gl-table class to tableClass prop', () => {
    factory({ tableClass: 'test-class' });

    expect(findBTableLite().props().tableClass).toEqual(['gl-table', 'test-class', null]);
  });

  it('adds sticky header class to tableClass prop', () => {
    factory({ stickyHeader: true });

    expect(findBTableLite().props().tableClass).toEqual([
      'gl-table',
      undefined,
      'gl-table--sticky-header',
    ]);
  });

  it('adds gl-table fields to table prop', () => {
    const fields = ['name', 'age'];

    factory({ fields });

    expect(wrapper.props('fields')).toEqual(fields);
    expect(findBTableLite().props('fields')).toEqual(fields);
  });
});
