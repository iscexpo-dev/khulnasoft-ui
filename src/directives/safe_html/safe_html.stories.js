import DOMPurify from 'dompurify';
import { SafeHtmlDirective as SafeHtml } from './safe_html';

const { sanitize } = DOMPurify;

const generateProps = ({
  unsafeHTML = '<a href="javascript:alert(document.domain)">Click me</a>',
} = {}) => ({
  unsafeHTML,
});

export const Default = (_args, { argTypes }) => ({
  directives: {
    SafeHtml,
  },
  props: Object.keys(argTypes),
  computed: {
    sanitizedHtml() {
      return sanitize(this.unsafeHTML);
    },
  },
  template: `
  <table class="gl-table">
    <thead>
      <tr>
        <th>Directive</th>
        <th>Output</th>
        <th>Rendered</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>v-html</strong></td>
        <td><code>{{ unsafeHTML }}</code></td>
        <td>N/A for security reasons</td>
      </tr>
      <tr>
        <td><strong>v-safe-html</strong></td>
        <td><code>{{ sanitizedHtml }}</code></td>
        <td v-safe-html="unsafeHTML"></td>
      </tr>
    </tbody>
  </table>
  `,
});
Default.args = generateProps();

export default {
  title: 'directives/safe-html-directive',
  component: SafeHtml,
  parameters: {
    docs: {
      description: {
        component:
          'See [Pajamas Design System documentation](https://design.khulnasoft.com/directives/safe-html) for usage and implementation details.',
      },
    },
  },
  tags: ['skip-visual-test'],
};
