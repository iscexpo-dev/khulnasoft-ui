import { mount } from '@vue/test-utils';
import { GlModalDirective } from './modal';

const EVENT_SHOW = 'bv::show::modal';

describe('GlModalDirective', () => {
  let wrapper;
  let showSpy;

  const findTrigger = () => wrapper.find('button');

  const createComponent = () => {
    const component = {
      directives: {
        GlModal: GlModalDirective,
      },
      data() {
        return {
          modalId: 'first-modal',
        };
      },
      mounted() {
        this.$root.$on(EVENT_SHOW, showSpy);
      },
      template: `<button v-gl-modal="modalId">Open</button>`,
    };

    wrapper = mount(component);
  };

  beforeEach(() => {
    showSpy = jest.fn();
    createComponent();
  });

  it('emits the show event for the modal it is bound to', async () => {
    await findTrigger().trigger('click');

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(showSpy).toHaveBeenCalledWith('first-modal', findTrigger().element);
  });

  it('emits the show event for the new modal after the binding value changes', async () => {
    await wrapper.setData({ modalId: 'second-modal' });

    await findTrigger().trigger('click');

    expect(showSpy).toHaveBeenCalledTimes(1);
    expect(showSpy).toHaveBeenCalledWith('second-modal', findTrigger().element);
  });
});
