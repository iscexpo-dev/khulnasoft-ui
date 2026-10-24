import { useArgs } from '@storybook/preview-api';

import 'iframe-resizer/js/iframeResizer.contentWindow.min';
import setConfigs from '../src/config';
import { themes } from '../src/utils/constants';
import logoWithBlackText from '../static/img/_logo_with_black_text.svg';
import logoWithWhiteText from '../static/img/_logo_with_white_text.svg';

import '../src/scss/storybook.scss';

function applyThemeClass(theme) {
  const root = document.documentElement;

  // Remove all theme classes
  themes.forEach(({ class: cls }) => cls && root.classList.remove(cls));

  // Apply new theme class
  const currentTheme = themes.find((item) => item.value === theme);
  if (currentTheme?.class) {
    root.classList.add(currentTheme.class);
  }
}

const decorators = [
  (story, context) => {
    const [, updateArgs] = useArgs();
    return story({ ...context, updateArgs });
  },
  (story, context) => {
    applyThemeClass(context.globals.theme);
    return story();
  },
  () => ({
    template: '<story />',
    async mounted() {
      window.addEventListener('message', this.toggleDarkModeClass);

      // Request initial dark mode state from parent
      window.parent.postMessage({ type: 'REQUEST_DARK_MODE_STATE' }, '*');

      await this.$nextTick();
      this.$el.parentElement.classList.add('vue-component-mounted');
    },
    beforeDestroy() {
      window.removeEventListener('message', this.toggleDarkModeClass);
    },
    methods: {
      toggleDarkModeClass(event) {
        if (event.data && typeof event.data.isDarkMode === 'boolean') {
          document.documentElement.classList.toggle('gl-dark', event.data.isDarkMode);
        }
      },
    },
  }),
];

const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'default',
    toolbar: {
      icon: 'paintbrush',
      items: themes,
      dynamicTitle: true,
    },
  },
};

setConfigs();

const brandAssets = {
  brandTitle: 'Pajamas Design System',
  brandUrl: 'https://design.khulnasoft.com',
};

const parameters = {
  darkMode: {
    current: 'light',
    stylePreview: true,
    classTarget: 'html',
    darkClass: 'gl-dark',
    dark: {
      ...brandAssets,
      brandImage: logoWithWhiteText,
    },
    light: {
      ...brandAssets,
      brandImage: logoWithBlackText,
    },
  },
  a11y: {},
  viewport: {
    viewports: {
      breakpointSmall: {
        name: 'Breakpoint small (width: 320px)',
        styles: {
          height: '568px',
          width: '320px',
        },
      },
      breakpointMedium: {
        name: 'Breakpoint medium (width: 768px)',
        styles: {
          height: '1024px',
          width: '768px',
        },
      },
      breakpointLarge: {
        name: 'Breakpoint large (width: 1024px)',
        styles: {
          height: '768px',
          width: '1024px',
        },
      },
      breakpointExtraLarge: {
        name: 'Breakpoint extra large (width: 1280px)',
        styles: {
          height: '800px',
          width: '1280px',
        },
      },
    },
  },
};

/**
 * When running in test mode, we do small adjustments to help with visual regression testing:
 * - Skip DocsPage settings to prevent JSX errors.
 * - Set the layout to fullscreen to ensure stories are full-width.
 */
if (process.env.IS_VISUAL_TEST) {
  parameters.layout = 'fullscreen';
} else {
  // eslint-disable-next-line global-require
  const { page } = require('./docs/page');
  parameters.docs = { page };
}

export default { decorators, parameters, globalTypes };
