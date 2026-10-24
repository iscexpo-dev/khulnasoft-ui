import translationKeys from '../translations';

export const i18n = translationKeys;

export const defaultConfig = {
  firstDayOfWeek: 0, // Defaults to 0 (Sunday)
};

export const glButtonConfig = {};
export const glToggleConfig = {};

let configured = false;

/**
 * Set KhulnaSoft UI configuration.
 *
 * @typedef {object} KhulnaSoftUIConfiguration
 * @template TValue=string
 * @property {undefined | Object} translations Generic translations for component labels to fall back to.
 * @property {undefined | Number} firstDayOfWeek Configured first day of the week, from 0 (Sunday) to 6 (Saturday).
 * @property {boolean} [accessibleDisabledButton] Temporary flag to enable the accessible disabled button.
 * @property {boolean} [accessibleDisabledToggle] Temporary flag to enable the accessible disabled toggle.
 *
 */
const setConfigs = ({
  translations,
  firstDayOfWeek,
  accessibleDisabledButton = false,
  accessibleDisabledToggle = false,
} = {}) => {
  if (configured) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('KhulnaSoft UI can only be configured once!');
    }

    return;
  }
  configured = true;

  if (typeof firstDayOfWeek === 'number' && firstDayOfWeek >= 0 && firstDayOfWeek <= 6) {
    defaultConfig.firstDayOfWeek = firstDayOfWeek;
  }

  if (typeof translations === 'object') {
    if (process.env.NODE_ENV === 'development') {
      const undefinedTranslationKeys = Object.keys(i18n).reduce((acc, current) => {
        if (!(current in translations)) {
          acc.push(current);
        }
        return acc;
      }, []);
      if (undefinedTranslationKeys.length) {
        /* eslint-disable no-console */
        console.warn(
          '[@khulnasoft/ui] The following translations have not been given, so will fall back to their default US English strings:',
        );
        console.table(undefinedTranslationKeys);
        /* eslint-enable no-console */
      }
    }

    Object.assign(i18n, translations);
  }

  // Temporary flag to enable the accessible disabled button feature.
  // This flag allows the feature to be opt-in during the rollout phase,
  // giving us the flexibility to test and validate its impact on user experience.

  // The global variable `accessibleDisabledButton` is set to a boolean value
  // to indicate whether the button should use aria-disabled while disabled.

  // Future Plan:
  // Once the accessible disabled button feature is validated and stable,
  // we will remove this temporary flag and make the feature the default behavior.
  // At that point, there will be no need for opt-in or opt-out mechanisms for this feature.
  if (typeof accessibleDisabledButton === 'boolean') {
    Object.assign(glButtonConfig, {
      accessibleDisabledButton,
    });
  }

  // Temporary flag for the accessible disabled toggle. Once validated, aria-disabled becomes
  // the default for disabled toggles and this flag is removed.
  if (typeof accessibleDisabledToggle === 'boolean') {
    Object.assign(glToggleConfig, {
      accessibleDisabledToggle,
    });
  }
};

export default setConfigs;
