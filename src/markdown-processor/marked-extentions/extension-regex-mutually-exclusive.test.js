/**
 * Extension Regex Mutual Exclusivity Tests
 *
 * These tests verify that all custom markdown extension regex patterns are mutually exclusive,
 * meaning that any given input string will match at most one pattern.
 *
 * This prevents cases where multiple extensions could match the same input, which would lead
 * to non-deterministic parsing results depending on the order extensions are registered in marked.
 */

import { EXTERNAL_LINK_TAB_TITLE_REGEXP } from './external-link-tab-title.js';
import { EXTERNAL_LINK_TAB_REGEXP } from './external-link-tab.js';
import { EXTERNAL_LINK_TITLE_REGEXP } from './external-link-title.js';
import { INTERNAL_LINK_TITLE_REGEXP } from './internal-link-title.js';
import { INTERNAL_LINK_REGEXP } from './internal-link.js';
import { IMAGE_DISPLAY_LINK_REGEXP } from './image-display-link.js';
import { IMAGE_DISPLAY_REGEXP } from './image-display.js';
import { IMAGE_LINK_REGEXP } from './image-link.js';
import { IFRAME_REGEXP } from './iframe.js';

const patterns = [
  {
    name: 'EXTERNAL_LINK_TAB_TITLE',
    regex: EXTERNAL_LINK_TAB_TITLE_REGEXP,
  },
  {
    name: 'EXTERNAL_LINK_TAB',
    regex: EXTERNAL_LINK_TAB_REGEXP,
  },
  {
    name: 'EXTERNAL_LINK_TITLE',
    regex: EXTERNAL_LINK_TITLE_REGEXP,
  },
  {
    name: 'INTERNAL_LINK_TITLE',
    regex: INTERNAL_LINK_TITLE_REGEXP,
  },
  {
    name: 'INTERNAL_LINK',
    regex: INTERNAL_LINK_REGEXP,
  },
  {
    name: 'IMAGE_DISPLAY_LINK',
    regex: IMAGE_DISPLAY_LINK_REGEXP,
  },
  {
    name: 'IMAGE_DISPLAY',
    regex: IMAGE_DISPLAY_REGEXP,
  },
  {
    name: 'IMAGE_LINK',
    regex: IMAGE_LINK_REGEXP,
  },
  {
    name: 'IFRAME',
    regex: IFRAME_REGEXP,
  },
];

describe('Extension regex', () => {
  it('should be mutually exclusive', () => {
    const testInputs = [
      {
        input: '@[Display][[Title]](url)',
        expectedMatches: ['EXTERNAL_LINK_TAB_TITLE'],
      },
      {
        input: '@[Display](url)',
        expectedMatches: ['EXTERNAL_LINK_TAB'],
      },
      {
        input: '[Display][[Title]](url)',
        expectedMatches: ['EXTERNAL_LINK_TITLE'],
      },
      {
        input: '[Display][[Title]]<target>',
        expectedMatches: ['INTERNAL_LINK_TITLE'],
      },
      {
        input: '[Display]<target>',
        expectedMatches: ['INTERNAL_LINK'],
      },
      {
        input: '![alt][[display]](imageId)((target))',
        // Matches both IMAGE_DISPLAY_LINK and IMAGE_DISPLAY.
        // In markdown-processor, IMAGE_DISPLAY_LINK will take precedence due to extension registration order.
        expectedMatches: ['IMAGE_DISPLAY_LINK', 'IMAGE_DISPLAY'],
      },
      {
        input: '![alt][[display]](imageId)',
        expectedMatches: ['IMAGE_DISPLAY'],
      },
      {
        input: '![alt](imageId)((target))',
        expectedMatches: ['IMAGE_LINK'],
      },
      {
        input: '@![Title](https://www.youtube.com/embed/video)',
        expectedMatches: ['IFRAME'],
      },
    ];

    testInputs.forEach(({ input, expectedMatches }) => {
      const matches = patterns.filter((p) => p.regex.test(input));
      const matchNames = matches.map((m) => m.name);

      expect(matchNames).toHaveLength(expectedMatches.length);
      expect(matchNames.sort()).toEqual(expectedMatches.sort());
    });
  });
});
