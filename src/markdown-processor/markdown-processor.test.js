import '@testing-library/jest-dom';
import { getByRole } from '@testing-library/dom';

import createDOMFromHTML from '../testing-helpers/create-dom-from-html';
import { getElementByType } from '../testing-helpers/custom-query';
import { SEE_MARK_PAYLOAD_DATA_ATTRIBUTES } from '../shared/common-markup';
import { SUPPORTED_COMPONENT_TYPES } from '../shared/supported-components';

import markdownProcessor from './markdown-processor';

describe('markdownProcessor', () => {
  it('should process markdown content as desired', () => {
    const markdownContent = '# Hello World';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const heading = getByRole(container, 'heading', {
      level: 1,
      name: 'Hello World',
    });

    expect(heading).toBeTruthy();
  });

  it('should handle math expressions with brackets', () => {
    const markdownContent = '\\({{\\left( -3 \\right)}^{3}}\\)';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    // snapshot matching
    expect(container).toMatchSnapshot();
  });

  it('should handle math expressions with dollar', () => {
    const markdownContent = '${{\\left( -3 \\right)}^{3}}$';
    const options = {
      latexDelimiter: 'dollar',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    // snapshot matching
    expect(container).toMatchSnapshot();
  });

  it('should process alert', () => {
    const markdownContent = `> [!WARNING]\n> Critical content demanding immediate user attention due to potential risks.`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const alertContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    expect(alertContainer).toBeTruthy();

    const payloadString = alertContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);
    expect(payload).toEqual({
      variant: 'warning',
      title: 'Warning',
      internalLinkId: null,
    });
  });

  it('should process internal link', () => {
    const markdownContent = `[some text]<sample-id>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const internalLinkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );

    expect(internalLinkContainer).toBeTruthy();

    const payloadString = internalLinkContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      text: 'some text',
      id: 'sample-id',
    });
  });

  it('should process internal link title', () => {
    const markdownContent = '[Go to section][[Section Reference]]<section-123>';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const internalLinkTitleContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK_TITLE
    );

    expect(internalLinkTitleContainer).toBeTruthy();

    const payloadString = internalLinkTitleContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      display: 'Go to section',
      title: 'Section Reference',
      id: 'section-123',
    });
  });

  it('should handle list of math expressions, with list items separated by newline', () => {
    const markdownContent = '* \\(a+b=c\\)\n\n* \\(c-b=a\\)';

    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    // snapshot matching
    expect(container).toMatchSnapshot();
  });
});
