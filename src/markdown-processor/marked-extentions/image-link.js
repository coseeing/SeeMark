import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

/**
 * Matches image with link syntax: ![alt](imageId)((target))
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - !           : Exclamation mark (distinguishes from link syntax)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]*)    : Capture group 1 - alt text (zero or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - \(          : Opening parenthesis (escaped)
 * - ([^)]+)     : Capture group 2 - image ID (one or more non-closing-paren chars)
 * - \)          : Closing parenthesis (escaped)
 * - \(\(        : Opening double parentheses (escaped)
 * - ([^)]+)     : Capture group 3 - target link (one or more non-closing-paren chars)
 * - \)\)        : Closing double parentheses (escaped)
 *
 * Example match: ![Thumbnail](thumb-123)((article-page))
 * - match[1] = "Thumbnail" (alt)
 * - match[2] = "thumb-123" (imageId)
 * - match[3] = "article-page" (target)
 */
// Regex exported for test
export const IMAGE_LINK_REGEXP = /^!\[([^\]]*)\]\(([^)]+)\)\(\(([^)]+)\)\)/;

const createBlobUrlManager = () => {
  const cache = new Map();

  return (href, imageFile) => {
    if (cache.has(href)) {
      return cache.get(href);
    }
    const blobUrl = URL.createObjectURL(imageFile);
    cache.set(href, blobUrl);
    return blobUrl;
  };
};

const blobUrlManager = createBlobUrlManager();

const markedImageLink = ({ imageFiles, shouldBuildImageObjectURL }) => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.IMAGE_LINK,
        level: 'inline',
        start(src) {
          return src.match(/!\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IMAGE_LINK_REGEXP);

          if (match) {
            const alt = match[1];
            const imageId = match[2];
            const target = match[3];

            try {
              const imageFile = imageFiles[imageId];
              const src = shouldBuildImageObjectURL
                ? blobUrlManager(imageId, imageFile)
                : imageFile;

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_LINK,
                raw: match[0],
                alt,
                imageId,
                target,
                meta: {
                  alt,
                  imageId,
                  src,
                  target,
                },
              };
            } catch (error) {
              console.error('Error processing image link:', error);

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_LINK,
                raw: match[0],
                alt,
                imageId,
                target,
                meta: {
                  alt,
                  imageId,
                  src: imageId,
                  target,
                },
              };
            }
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);

          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.IMAGE_LINK,
            meta,
            children
          );
        },
      },
    ],
  };
};

export default markedImageLink;
