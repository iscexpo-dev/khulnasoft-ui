import { shallowMount } from '@vue/test-utils';
import { merge } from 'lodash-es';
import { modalButtonDefaults } from '~/utils/constants';
import { BModal } from '../../../vendor/bootstrap-vue/src/components/modal/modal';
import CloseButton from '../../shared_components/close_button/close_button.vue';
import Button from '../button/button.vue';
import { logWarning } from '../../../utils/utils';
import Modal from './modal.vue';

const BModalStub = merge({}, BModal.options, {
  methods: {
    onCancel: jest.fn(function cancel() {
      this.$emit('cancel');
    }),
    onClose: jest.fn(),
    onOk: jest.fn(function ok() {
      this.$emit('ok');
    }),
  },
  render(h) {
    return h('div', Object.values(this.$slots));
  },
});

jest.mock('../../../utils/utils', () => ({
  logWarning: jest.fn(),
}));

describe('Modal component', () => {
  let wrapperListeners;
  let wrapper;

  const findModal = () => wrapper.findComponent(BModalStub);
  const findPrimaryButton = () => wrapper.find('.js-modal-action-primary');
  const findSecondaryButton = () => wrapper.find('.js-modal-action-secondary');
  const findCancelButton = () => wrapper.find('.js-modal-action-cancel');

  const expectCloseButton = () => expect(wrapper.findComponent(CloseButton).exists()).toBe(true);

  const createComponent = ({ props = {}, slots = {}, stubModal = true } = {}) => {
    wrapperListeners = {
      canceled: jest.fn(),
      close: jest.fn(),
      hidden: jest.fn(),
      primary: jest.fn(),
      secondary: jest.fn(),
    };

    wrapper = shallowMount(Modal, {
      propsData: {
        modalId: 'modal-id',
        ...props,
      },
      slots,
      listeners: wrapperListeners,
      stubs: {
        'b-modal': stubModal ? BModalStub : BModal,
      },
    });
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('default', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders BModal', () => {
      expect(findModal().exists()).toBe(true);
    });

    it('applies default modal class', () => {
      expect(findModal().props('modalClass')).toContain('gl-modal');
    });
  });

  describe('props', () => {
    const tagName = 'h1';

    it.each`
      headerTag  | footerTag  | propName
      ${tagName} | ${null}    | ${'headerTag'}
      ${null}    | ${tagName} | ${'footerTag'}
    `(
      'passes tag name provided by $propName prop to the nested BModal component',
      ({ headerTag, footerTag, propName }) => {
        createComponent({
          props: { headerTag, footerTag },
          stubModal: false,
        });

        const bootstrapModalComponent = wrapper.findComponent(BModal);

        expect(bootstrapModalComponent.props(propName)).toBe(tagName);
      },
    );
  });

  describe('slots', () => {
    const title = 'A custom title';
    const slot = `<h4 class="custom-title">${title}</h4>`;

    it('renders modal-header slot properly', () => {
      createComponent({
        slots: { 'modal-header': slot },
      });
      const defaultHeader = wrapper.find('h2.modal-title');
      const customHeader = wrapper.find('h4.custom-title');

      expect(defaultHeader.exists()).toBe(false);
      expect(customHeader.exists()).toBe(true);
      expect(customHeader.text()).toBe(title);
      expectCloseButton();
    });

    it('renders modal-title slot properly', () => {
      createComponent({
        slots: { 'modal-title': slot },
      });
      const defaultHeader = wrapper.find('h2.modal-title');
      const customTitle = defaultHeader.find('h4.custom-title');

      expect(defaultHeader.exists()).toBe(true);
      expect(customTitle.exists()).toBe(true);
      expect(customTitle.text()).toBe(title);
      expectCloseButton();
    });
  });

  describe('modal footer', () => {
    const props = {
      actionPrimary: {
        text: 'Primary',
        attributes: { variant: 'info' },
      },
      actionSecondary: {
        text: 'Secondary',
      },
      actionCancel: {
        text: 'Cancel',
        attributes: { variant: 'danger' },
      },
    };

    beforeEach(() => {
      createComponent({ props });
    });

    it('should render three buttons', () => {
      expect(wrapper.findAllComponents(Button)).toHaveLength(3);
    });

    it('buttons should render prop text', () => {
      expect(findPrimaryButton().text()).toBe('Primary');
      expect(findSecondaryButton().text()).toBe('Secondary');
      expect(findCancelButton().text()).toBe('Cancel');
    });

    it('attributes array to be returned', () => {
      const attributes = wrapper.vm.buttonBinding(props.actionPrimary, 'actionPrimary');
      expect(attributes).toBe(props.actionPrimary.attributes);
    });

    it('default attributes to be returned', () => {
      const attributes = wrapper.vm.buttonBinding(props.actionSecondary, 'actionSecondary');
      expect(attributes).toBe(modalButtonDefaults.actionSecondary);
    });

    it('does not emit anything', () => {
      Object.keys(wrapperListeners).forEach((evt) => {
        expect(wrapperListeners[evt]).not.toHaveBeenCalled();
      });
    });

    describe('when cancel is clicked', () => {
      beforeEach(() => {
        findCancelButton().vm.$emit('click');
      });

      it('should emit canceled event', () => {
        expect(BModalStub.methods.onCancel).toHaveBeenCalledTimes(1);
        expect(wrapperListeners.canceled).toHaveBeenCalledTimes(1);
      });
    });

    describe('when primary is clicked', () => {
      beforeEach(() => {
        findPrimaryButton().vm.$emit('click');
      });

      it('should emit primary event', () => {
        expect(BModalStub.methods.onOk).toHaveBeenCalledTimes(1);
        expect(wrapperListeners.primary).toHaveBeenCalledTimes(1);
      });
    });

    describe('when secondary is clicked', () => {
      beforeEach(() => {
        findSecondaryButton().vm.$emit('click');
      });

      it('should emit secondary', () => {
        expect(wrapperListeners.secondary).toHaveBeenCalledTimes(1);
      });

      it('should close modal', () => {
        expect(BModalStub.methods.onClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('when secondary is clicked with default prevented', () => {
      beforeEach(() => {
        findSecondaryButton().vm.$emit('click', { defaultPrevented: true });
      });

      it('should emit secondary', () => {
        expect(wrapperListeners.secondary).toHaveBeenCalledTimes(1);
      });

      it('should close modal', () => {
        expect(BModalStub.methods.onClose).not.toHaveBeenCalled();
      });
    });
  });

  it('accepts custom modal class', () => {
    createComponent({ props: { modalClass: 'modal-class-override another-override' } });
    expect(findModal().props('modalClass')).toContain('gl-modal');
    expect(findModal().props('modalClass')).toContain('modal-class-override another-override');
  });

  describe('when closed', () => {
    beforeEach(() => {
      createComponent();
      findModal().vm.$emit('close');
    });

    it('should emit closed', () => {
      expect(wrapperListeners.secondary).not.toHaveBeenCalled();
      expect(wrapperListeners.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessible name warning', () => {
    it.each`
      description                                            | title            | ariaLabel        | showWarning
      ${'is logged when there is no title or ariaLabel'}     | ${undefined}     | ${undefined}     | ${true}
      ${'is not logged when there is a title'}               | ${'modal title'} | ${undefined}     | ${false}
      ${'is not logged when there is an ariaLabel'}          | ${undefined}     | ${'modal title'} | ${false}
      ${'is not logged when there is a title and ariaLabel'} | ${'modal title'} | ${'modal title'} | ${false}
    `('$description', ({ title, ariaLabel, showWarning }) => {
      createComponent({ props: { title, ariaLabel } });

      const calledTimes = showWarning ? 1 : 0;
      expect(logWarning).toHaveBeenCalledTimes(calledTimes);
    });
  });

  it('binds visible property to the BModal visible property', async () => {
    createComponent({ stubModal: false });

    expect(wrapper.props().visible).toBe(false);
    expect(wrapper.findComponent(BModal).props().visible).toBe(false);

    await wrapper.setProps({ visible: true });

    expect(wrapper.findComponent(BModal).props().visible).toBe(true);
  });

  it('sets visible property and change event as the component models', () => {
    expect(Modal.model).toEqual({
      prop: 'visible',
      event: 'change',
    });
  });

  it('emits change event when base modal component emits change event', () => {
    createComponent();

    findModal().vm.$emit('change');

    expect(wrapper.emitted('change')).toHaveLength(1);
  });
});
