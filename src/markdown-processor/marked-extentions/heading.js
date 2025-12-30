import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';
import { extractTokenMeta, buildHTMLMarkup } from './helpers';

/**
 * Converts text to a URL-friendly slug.
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Preserves Chinese characters, letters, numbers, and hyphens
 * - Removes consecutive hyphens and leading/trailing hyphens
 *
 * @param {string} text - The text to slugify
 * @returns {string} The slugified text
 *
 * @example
 * slugify("Hello World") // "hello-world"
 * slugify("What is JavaScript?") // "what-is-javascript"
 * slugify("什麼是 React") // "什麼是-react"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Remove special chars, keep letters/numbers/spaces/hyphens (Unicode)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a unique ID by appending a suffix if the base ID is already used.
 *
 * @param {string} baseId - The base slug ID
 * @param {Map<string, number>} usedIds - Map tracking used IDs and their counts
 * @returns {string} A unique ID
 */
function getUniqueId(baseId, usedIds) {
  if (!usedIds.has(baseId)) {
    usedIds.set(baseId, 0);
    return baseId;
  }

  const count = usedIds.get(baseId) + 1;
  usedIds.set(baseId, count);
  return `${baseId}-${count}`;
}

/**
 * Marked extension for heading custom component.
 * All headings become custom components with auto-generated slug IDs.
 */
const markedHeading = () => {
  // Track used IDs within a single markdown document to ensure uniqueness
  const usedIds = new Map();

  const renderer = {
    heading(token) {
      const { depth, text, tokens = [] } = token;

      // Generate unique slug ID from heading text
      const baseId = slugify(text);
      const id = getUniqueId(baseId, usedIds);

      // Parse inline tokens for children (handles bold, italic, links, etc.)
      const children = this.parser.parseInline(tokens);

      const meta = extractTokenMeta(token, {
        id,
        level: depth,
        text,
      });

      return buildHTMLMarkup(SUPPORTED_COMPONENT_TYPES.HEADING, meta, children);
    },
  };

  return { renderer };
};

export default markedHeading;
