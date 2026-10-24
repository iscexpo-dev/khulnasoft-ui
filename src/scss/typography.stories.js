export const Default = () => ({
  template: `
    <div>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <hr />
      <p>
        The p HTML element represents a paragraph. Paragraphs are usually represented in visual media as
        blocks of text separated from adjacent blocks by blank lines and/or first-line indentation, but
        HTML paragraphs can be any structural grouping of related content, such as images or form
        fields.
      </p>
      <p>
        Paragraphs can contain inline elements such as <a href="#">links</a>,
        <abbr title="abbreviation">abbr</abbr>, <strong>strong</strong>, <em>emphasis</em>,
        <del>delete</del>, <u>underline</u>, <b>bold</b>, <i>italic</i>,
        <s>strikethrough</s>,<mark>mark</mark>, <kbd>key</kbd>, <code>code</code>, <q>quotation</q>,
        <small>small</small>, <sub>subscript</sub>, <sup>superscript</sup>, and
        <var>variable</var> elements.
      </p>
      <pre><code>javascript:(function() { document.documentElement.classList.toggle('gl-dark'); })();</code></pre>
    </div>
  `,
});

export const Blockquote = () => ({
  template: `
    <div>
      <blockquote>
        <p>
          The blockquote HTML element indicates that the enclosed text is an extended quotation.
          Usually, this is rendered visually by indentation. A URL for the source of the quotation may
          be given using the cite attribute, while a text representation of the source can be given
          using the cite element.
        </p>
        <cite>Blockquote citation</cite>
      </blockquote>
      <blockquote class="blockquote">
        <p>
          The blockquote HTML element indicates that the enclosed text is an extended quotation.
          Usually, this is rendered visually by indentation. A URL for the source of the quotation may
          be given using the cite attribute, while a text representation of the source can be given
          using the cite element.
        </p>
        <cite>Blockquote citation</cite>
      </blockquote>
    </div>
  `,
});

export const Lists = () => ({
  template: `
    <div>
      <ul>
        <li>
          Unordered list item
        </li>
        <li>
          Unordered list item
          <ul>
            <li>
              Child unordered list item
              <ul>
                <li>
                  Grandchild unordered list item
                </li>
                <li>
                  Grandchild unordered list item
                </li>
              </ul>
            </li>
            <li>
              Child unordered list item
            </li>
          </ul>
        </li>
        <li>
          Unordered list item
        </li>
        <li>
          Unordered list item
        </li>
      </ul>
      <ol>
        <li>
          Ordered list item
        </li>
        <li>
          Ordered list item
          <ol>
            <li>
              Child ordered list item
              <ol>
                <li>
                  Grandchild ordered list item
                </li>
                <li>
                  Grandchild ordered list item
                </li>
              </ol>
            </li>
            <li>
              Child ordered list item
            </li>
          </ol>
        </li>
        <li>
          Ordered list item
        </li>
        <li>
          Ordered list item
        </li>
      </ol>
    </div>
  `,
});

export const Tables = () => ({
  template: `
    <div>
      <table>
        <caption>
          Table Caption
        </caption>
        <thead>
          <tr>
            <th scope="col">Table header</th>
            <th scope="col">Table header</th>
            <th scope="col">Table header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="col">Table footer</th>
            <th scope="col">Table footer</th>
            <th scope="col">Table footer</th>
          </tr>
        </tfoot>
      </table>
      <table class="table">
        <caption>
          Table Caption
        </caption>
        <thead>
          <tr>
            <th scope="col">Table header</th>
            <th scope="col">Table header</th>
            <th scope="col">Table header</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
          <tr>
            <td>Table cell</td>
            <td>Table cell</td>
            <td>Table cell</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="col">Table footer</th>
            <th scope="col">Table footer</th>
            <th scope="col">Table footer</th>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
});

// eslint-disable-next-line storybook/csf-component
export default {
  title: 'scss/typography',
};
