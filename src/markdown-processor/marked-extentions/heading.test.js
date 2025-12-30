import '@testing-library/jest-dom';

import createDOMFromHTML from '../../testing-helpers/create-dom-from-html';
import {
  getElementByType,
  getAllElementsByType,
} from '../../testing-helpers/custom-query';
import { SEE_MARK_PAYLOAD_DATA_ATTRIBUTES } from '../../shared/common-markup';
import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import markdownProcessor from '../markdown-processor';
import { slugify } from './heading';

describe('slugify', () => {
  it('should convert basic text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('What is JavaScript?')).toBe('what-is-javascript');
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('should preserve Chinese characters', () => {
    expect(slugify('什麼是 React')).toBe('什麼是-react');
    expect(slugify('前端開發入門')).toBe('前端開發入門');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
  });

  it('should handle leading/trailing spaces', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(slugify('Chapter 1 Introduction')).toBe('chapter-1-introduction');
  });
});

describe('markdownProcessor - heading', () => {
  const options = {
    latexDelimiter: 'bracket',
    documentFormat: 'inline',
    imageFiles: {},
  };

  it('should process heading with auto-generated slug id in payload', () => {
    const markdownContent = '# Hello World';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const heading = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe('Hello World');

    const payload = JSON.parse(
      heading.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    expect(payload).toMatchObject({
      id: 'hello-world',
      level: 1,
      text: 'Hello World',
    });
    expect(payload.position).toBeDefined();
  });

  it('should handle all heading levels', () => {
    const levels = [1, 2, 3, 4, 5, 6];

    levels.forEach((level) => {
      const hashes = '#'.repeat(level);
      const markdownContent = `${hashes} Heading ${level}`;
      const result = markdownProcessor(markdownContent, options);
      const container = createDOMFromHTML(result);

      const heading = getElementByType(
        container,
        SUPPORTED_COMPONENT_TYPES.HEADING
      );

      const payload = JSON.parse(
        heading.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
      );
      expect(payload.level).toBe(level);
      expect(payload.id).toBe(`heading-${level}`);
    });
  });

  it('should include position info in heading payload', () => {
    const markdownContent = '# Test Heading';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const heading = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );

    const payload = JSON.parse(
      heading.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    expect(payload.position).toBeDefined();
    expect(payload.position.start).toBe(0);
    expect(payload.position.end).toBe(14);
  });

  it('should preserve inline formatting in headings', () => {
    const markdownContent = '# Hello **World**';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const heading = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );
    const strong = heading.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong.textContent).toBe('World');
  });

  it('should generate unique ids for duplicate headings', () => {
    const markdownContent =
      '# Introduction\n\n## Introduction\n\n### Introduction';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const headings = getAllElementsByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );
    expect(headings).toHaveLength(3);

    const payloads = headings.map((h) =>
      JSON.parse(h.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES))
    );
    expect(payloads[0].id).toBe('introduction');
    expect(payloads[1].id).toBe('introduction-1');
    expect(payloads[2].id).toBe('introduction-2');
  });

  it('should handle special characters in heading text', () => {
    const markdownContent = '## What is JavaScript?';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const heading = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );

    const payload = JSON.parse(
      heading.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    expect(payload.id).toBe('what-is-javascript');
    expect(heading.textContent).toBe('What is JavaScript?');
  });

  it('should preserve Chinese characters in slug', () => {
    const markdownContent = '# 什麼是 React';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const heading = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );

    const payload = JSON.parse(
      heading.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    expect(payload.id).toBe('什麼是-react');
  });

  it('should handle multiple headings with different text', () => {
    const markdownContent = '# First Section\n\n## Second Section';
    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const headings = getAllElementsByType(
      container,
      SUPPORTED_COMPONENT_TYPES.HEADING
    );

    const payloads = headings.map((h) =>
      JSON.parse(h.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES))
    );
    expect(payloads[0].id).toBe('first-section');
    expect(payloads[1].id).toBe('second-section');
  });
});
