import { mount } from '@vue/test-utils';
import GlButton from '../../base/button/button.vue';
import ClipboardButton from './clipboard_button.vue';

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ClipboardButton', () => {
  let wrapper;

  const createComponent = (props = {}) => {
    wrapper = mount(ClipboardButton, {
      propsData: {
        text: 'test text',
        ...props,
      },
    });
  };

  const findButton = () => wrapper.findComponent(GlButton);

  it('renders with default props', () => {
    createComponent();

    expect(findButton().exists()).toBe(true);
    expect(findButton().props('icon')).toBe('copy-to-clipboard');
    expect(findButton().props('category')).toBe('tertiary');
    expect(findButton().props('variant')).toBe('default');
  });

  it('copies text to clipboard on click', async () => {
    navigator.clipboard.writeText.mockResolvedValue();
    createComponent();

    await findButton().trigger('click');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('updates tooltip on successful copy', async () => {
    navigator.clipboard.writeText.mockResolvedValue();
    createComponent();

    expect(wrapper.html()).toContain('Copy to clipboard');

    await findButton().trigger('click');

    expect(wrapper.html()).not.toContain('Copy to clipboard');
    expect(wrapper.html()).toContain('Copied');
  });

  it('accepts custom title', () => {
    createComponent({ title: 'Custom copy title' });

    expect(findButton().attributes('title')).toBe('Custom copy title');
  });

  it('accepts custom size', () => {
    createComponent({ size: 'small' });

    expect(findButton().props('size')).toBe('small');
  });
});
