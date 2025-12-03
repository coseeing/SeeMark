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
];

describe('Extension regex', () => {
  it('should be mutually exclusive', () => {
    const testInputs = [
      '@[Display][[Title]](url)',
      '@[Display](url)',
      '[Display][[Title]](url)',
    ];

    const clashMatrix = testInputs.map((input) => {
      return patterns.map((p) => (p.regex.test(input) ? 1 : 0));
    });

    // Each input should match exactly one pattern (sum of row = 1)
    clashMatrix.forEach((row) => {
      const sum = row.reduce((a, b) => a + b, 0);
      expect(sum).toBe(1);
    });
  });
});
