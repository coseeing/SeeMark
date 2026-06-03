import { render } from '@testing-library/react';

import {
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
} from '../../shared/common-markup';
import { buildHTMLMarkup } from './helpers';
import convertMarkup from '../../markup-converters/react/converter';

describe('buildHTMLMarkup', () => {
  it('builds a div with payload and element-type attributes', () => {
    const markup = buildHTMLMarkup('alert', { text: 'hello' }, 'child');

    expect(markup).toBe(
      `<div ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES}='{&quot;text&quot;:&quot;hello&quot;}' ${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="alert">child</div>`
    );
  });

  it('uses a span when inline is true', () => {
    const markup = buildHTMLMarkup('math', { tex: 'x' }, '', { inline: true });

    expect(markup.startsWith('<span ')).toBe(true);
    expect(markup.endsWith('</span>')).toBe(true);
  });

  it('escapes single quotes so the attribute delimiter is not broken', () => {
    const markup = buildHTMLMarkup('alert', { text: "it's a cat" }, '');

    // The raw apostrophe must not appear unescaped inside the single-quoted attribute
    expect(markup).not.toContain("'it's");
    expect(markup).toContain('&#39;');
  });

  it('escapes characters significant to the HTML parser', () => {
    const markup = buildHTMLMarkup('alert', { text: `<a> & "b" 'c'` }, '');

    expect(markup).toContain('&lt;');
    expect(markup).toContain('&gt;');
    expect(markup).toContain('&amp;');
    expect(markup).toContain('&quot;');
    expect(markup).toContain('&#39;');
  });

  it('round-trips meta containing special characters through the converter', () => {
    const meta = {
      text: `it's a "quoted" <tag> & more`,
      nested: { value: "don't break" },
    };

    const markup = buildHTMLMarkup('custom-component', meta, '');

    let captured;
    render(
      convertMarkup(markup, {
        'custom-component': (props) => {
          captured = props;
          return null;
        },
      })
    );

    expect(captured.text).toBe(meta.text);
    expect(captured.nested).toEqual(meta.nested);
  });
});
