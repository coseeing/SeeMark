import { createMarkdownProcessor } from '../markdown-processor/markdown-processor';
import {
  slugify,
  getUniqueId,
} from '../markdown-processor/marked-extentions/heading';

/**
 * Recursively extracts plain text from a marked inline token tree,
 * stripping all markdown syntax (bold, italic, code spans, links, etc.).
 *
 * @param {object[]} inlineTokens - Inline token array from a marked heading token
 * @returns {string}
 */
function extractPlainText(inlineTokens = []) {
  return inlineTokens
    .map((token) =>
      token.tokens
        ? extractPlainText(token.tokens)
        : (token.text ?? token.display ?? '')
    )
    .join('');
}

/**
 * Parses markdown and returns a flat list of headings (h1–h6) with their
 * level, slug ID, and plain text. IDs are generated with the same slugify +
 * uniqueness logic used by the markedHeading renderer extension, so IDs
 * produced here will always match the `id` payload on rendered heading
 * components.
 *
 * @param {string} markdown - Raw markdown string
 * @param {object} [options]
 * @param {string} [options.latexDelimiter] - LaTeX delimiter style ('bracket', 'dollar', 'latex').
 *   Must match the value used by the markdown renderer so that math tokens
 *   inside headings are recognised and their text is correctly extracted.
 *   Defaults to 'bracket'.
 * @param {boolean} [options.latexOnly=false] - When true, disables AsciiMath support.
 *   Must match the value used by the markdown renderer.
 * @returns {{ level: number, id: string, text: string }[]}
 *
 * @example
 * createTableOfContents('## Hello\n### World')
 * // [
 * //   { level: 2, id: 'hello', text: 'Hello' },
 * //   { level: 3, id: 'world', text: 'World' },
 * // ]
 */
const createTableOfContents = (markdown, options = {}) => {
  const { lexer } = createMarkdownProcessor({
    latexDelimiter: options.latexDelimiter ?? 'bracket',
    latexOnly: options.latexOnly ?? false,
  });
  const tokens = lexer(markdown);
  const usedIds = new Map();

  return tokens
    .filter((token) => token.type === 'heading')
    .map(({ depth: level, text, tokens: inlineTokens = [] }) => {
      const id = getUniqueId(slugify(text), usedIds);
      return { level, id, text: extractPlainText(inlineTokens) };
    });
};

export default createTableOfContents;
