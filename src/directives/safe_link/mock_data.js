export const absoluteUrls = [
  'http://example.org',
  'http://example.org:8080',
  'https://example.org',
  'https://example.org:8080',
  'https://192.168.1.1',
  'ftp://192.168.1.1',
  'mailto:someone@example.com',
];

/* eslint-disable no-script-url */
export const javascriptUrls = [
  'javascript:',
  'javascript:alert("XSS")',
  'jav\tascript:alert("XSS");',
];
/* eslint-enable no-script-url */

export const encodedJavaScriptUrls = [
  '&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041',
  '&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;',
  '&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29',
  ' &#14;  javascript:alert("XSS");',
];

export const relativeUrls = [
  './relative/link',
  '../relative/link',
  '/relative/link',
  '/users/sign_in',
  '#docs/link',
  '#',
];
