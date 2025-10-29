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
      position: { start: 0, end: 90 },
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
      display: 'some text',
      target: 'sample-id',
      position: { start: 0, end: 22 },
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
      target: 'section-123',
      position: {
        start: 0,
        end: 49,
      },
    });
  });

  it('should process external link tab', () => {
    const markdownContent = '@[Documentation](https://docs.example.com)';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const externalLinkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB
    );

    expect(externalLinkContainer).toBeTruthy();

    const payloadString = externalLinkContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      display: 'Documentation',
      position: { start: 0, end: 42 },
      target: 'https://docs.example.com',
    });
  });

  it('should process external link title', () => {
    const markdownContent =
      '[Documentation][[Read the docs]](https://docs.example.com)';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const externalLinkTitleContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TITLE
    );

    expect(externalLinkTitleContainer).toBeTruthy();

    const payloadString = externalLinkTitleContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      display: 'Documentation',
      position: { start: 0, end: 58 },
      title: 'Read the docs',
      target: 'https://docs.example.com',
    });
  });

  it('should process external link tab title', () => {
    const markdownContent =
      '@[Documentation][[Read the docs]](https://docs.example.com)';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const externalLinkTabTitleContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.EXTERNAL_LINK_TAB_TITLE
    );

    expect(externalLinkTabTitleContainer).toBeTruthy();

    const payloadString = externalLinkTabTitleContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      display: 'Documentation',
      position: { start: 0, end: 59 },
      title: 'Read the docs',
      target: 'https://docs.example.com',
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

  it('should process image link', () => {
    const markdownContent = `![alt text](image-123)((https://example.com/target))`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {
        'image-123': 'https://example.com/image.jpg',
      },
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const imageLinkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.IMAGE_LINK
    );

    expect(imageLinkContainer).toBeTruthy();

    const payloadString = imageLinkContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      alt: 'alt text',
      imageId: 'image-123',
      src: 'https://example.com/image.jpg',
      target: 'https://example.com/target',
    });
  });

  it('should process image display', () => {
    const markdownContent = `![alt text][[Display caption]](image-456)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {
        'image-456': 'https://example.com/image2.jpg',
      },
    };

    const result = markdownProcessor(markdownContent, options);

    const container = createDOMFromHTML(result);

    const imageDisplayContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY
    );

    expect(imageDisplayContainer).toBeTruthy();

    const payloadString = imageDisplayContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );

    const payload = JSON.parse(payloadString);

    expect(payload).toEqual({
      alt: 'alt text',
      display: 'Display caption',
      imageId: 'image-456',
      src: 'https://example.com/image2.jpg',
    });
  });
});
