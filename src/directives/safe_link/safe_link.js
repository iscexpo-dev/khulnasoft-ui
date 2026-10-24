import Vue from 'vue';

const getBaseURL = () => {
  const { protocol, host } = window.location;
  return `${protocol}//${host}`;
};

const isTargetBlank = (target) => {
  return target === '_blank';
};

export const isExternalURL = (target, hostname) => {
  return isTargetBlank(target) && hostname !== window.location.hostname;
};

const secureRel = (rel) => {
  const rels = rel ? rel.trim().split(' ') : [];

  if (!rels.includes('noopener')) {
    rels.push('noopener');
  }
  if (!rels.includes('noreferrer')) {
    rels.push('noreferrer');
  }
  return rels.join(' ');
};

const isSafeURL = (url) => {
  try {
    const parsedURL = new URL(url, getBaseURL());
    return ['http:', 'https:', 'mailto:', 'ftp:'].includes(parsedURL.protocol);
  } catch {
    return false;
  }
};

const transform = (el, { arg: { skipSanitization = false } = {} } = {}) => {
  if (skipSanitization) {
    return;
  }

  const { href, target, rel } = el;

  if (!isSafeURL(href)) {
    el.href = 'about:blank';
  }

  if (isTargetBlank(target)) {
    el.rel = secureRel(rel);
  }
};

export const SafeLinkDirective = {
  inserted: transform,
  update: (...args) => {
    Vue.nextTick(() => {
      transform(...args);
    });
  },
};
