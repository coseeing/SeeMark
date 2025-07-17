/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

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
});
