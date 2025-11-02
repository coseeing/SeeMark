/**
 * Creates a position tracker for Marked.js tokens.
 *
 * This module provides hooks to automatically track the position of tokens
 * in the source markdown text. Each token will have a `position` property
 * with `start` and `end` character offsets.
 *
 * Features:
 * - Handles duplicate markdown patterns (e.g., multiple identical links)
 * - Handles parent-child tokens with the same raw content (e.g., paragraph containing image)
 * - Automatically resets state for each new document
 *
 * @returns {Object} An object with `walkTokens` and `preprocess` hook functions
 */
export function createPositionTracker() {
  let sourceMarkdown = '';

  const processedTokens = new WeakSet();

  // Track used position keys to handle duplicates and parent-child tokens
  // Key format: "start:type:raw" (e.g., "0:image:![alt](id)")
  const usedPositionKeys = new Set();

  /**
   * WalkTokens hook function to add position information to tokens.
   * Called by Marked.js for every token in the AST.
   *
   * @param {Object} token - The Marked.js token object
   */
  function walkTokens(token) {
    if (!token.raw || processedTokens.has(token)) {
      return;
    }

    processedTokens.add(token);

    if (sourceMarkdown) {
      const occurrences = [];
      let searchIndex = 0;

      while (searchIndex < sourceMarkdown.length) {
        const index = sourceMarkdown.indexOf(token.raw, searchIndex);
        if (index === -1) break;

        occurrences.push(index);
        searchIndex = index + 1;
      }

      // Find the first occurrence that hasn't been used yet
      // Use a combination of position, type, and raw content to create a unique key
      // This handles cases where:
      // 1. Multiple identical markdown patterns exist (e.g., [link]<id> and [link]<id>)
      // 2. Parent tokens have the same raw as child tokens (e.g., paragraph containing image)
      for (const start of occurrences) {
        const positionKey = `${start}:${token.type}:${token.raw}`;

        if (!usedPositionKeys.has(positionKey)) {
          token.position = {
            start: start,
            end: start + token.raw.length,
          };
          usedPositionKeys.add(positionKey);
          return;
        }
      }
    }
  }

  /**
   * Preprocess hook to store source markdown and reset state.
   * Called by Marked.js before parsing begins.
   *
   * @param {string} markdown - The complete source markdown text
   * @returns {string} The unmodified markdown (passthrough)
   */
  function preprocess(markdown) {
    sourceMarkdown = markdown;
    usedPositionKeys.clear(); // Reset used positions for each new document
    return markdown;
  }

  return {
    walkTokens,
    preprocess,
  };
}
