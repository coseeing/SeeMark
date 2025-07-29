import React from 'react';
import PropTypes from 'prop-types';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import {
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
} from '../../shared/common-markup';
import converter from './converter';

describe('Converter', () => {
  it('should convert SeeMark markup to React components', () => {
    render(
      converter(
        '<p>This is a paragraph.</p><h1>Heading 1</h1><ul><li>List item 1</li><li>List item 2</li></ul>'
      )
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Heading 1' })
    ).toBeInTheDocument();
  });

  it('should handle custom components', () => {
    const elementType = 'custom-component';
    const payload = { text: 'Custom Component Text' };

    const html = `<div ${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${elementType}" ${SEE_MARK_PAYLOAD_DATA_ATTRIBUTES}='${JSON.stringify(payload)}'><div>
</div></div>`;

    const CustomComponent = ({ text }) => (
      <div className="customComponentWrapper">
        <p className="customComponentText">{text}</p>
      </div>
    );

    CustomComponent.propTypes = {
      text: PropTypes.string.isRequired,
    };

    render(
      converter(html, {
        [elementType]: CustomComponent,
      })
    );

    const textElement = screen.getByText(payload.text);
    const wrapper = textElement.closest('div');

    expect(wrapper).toHaveClass('customComponentWrapper');
    expect(textElement.tagName).toBe('P');
    expect(textElement).toHaveClass('customComponentText');
  });
});
