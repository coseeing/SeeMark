import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { createRenderer } from './helpers';

/**
 * Matches image with display text and link syntax: ![alt][[display]](imageId)((target))
 *
 * Pattern breakdown:
 * - ^           : Must start at beginning (required by marked.js tokenizer since it checks from start of string)
 * - !           : Exclamation mark (distinguishes from link syntax)
 * - \[          : Opening square bracket (escaped)
 * - ([^\]]*)    : Capture group 1 - alt text (zero or more non-closing-bracket chars)
 * - \]          : Closing square bracket (escaped)
 * - \[\[        : Opening double square brackets (escaped)
 * - ([^\]]+)    : Capture group 2 - display text (one or more non-closing-bracket chars)
 * - \]\]        : Closing double square brackets (escaped)
 * - \(          : Opening parenthesis (escaped)
 * - ([^)]+)     : Capture group 3 - image ID (one or more non-closing-paren chars)
 * - \)          : Closing parenthesis (escaped)
 * - \(\(        : Opening double parentheses (escaped)
 * - ([^)]+)     : Capture group 4 - target link (one or more non-closing-paren chars)
 * - \)\)        : Closing double parentheses (escaped)
 *
 * Example match: ![Product photo][[See product details]](img-001)((product-page))
 * - match[1] = "Product photo" (alt)
 * - match[2] = "See product details" (display)
 * - match[3] = "img-001" (imageId)
 * - match[4] = "product-page" (target)
 */
// Regex exported for test
export const IMAGE_DISPLAY_LINK_REGEXP =
  /^!\[([^\]]*)\]\[\[([^\]]+)\]\]\(([^)]+)\)\(\(([^)]+)\)\)/;

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

const markedImageDisplayLink = ({ imageFiles, shouldBuildImageObjectURL }) => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
        level: 'inline',
        start(src) {
          return src.match(/!\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IMAGE_DISPLAY_LINK_REGEXP);

          if (match) {
            const alt = match[1];
            const display = match[2];
            const imageId = match[3];
            const target = match[4];

            try {
              const imageFile = imageFiles[imageId];
              const src = shouldBuildImageObjectURL
                ? blobUrlManager(imageId, imageFile)
                : imageFile;

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
                raw: match[0],
                alt,
                display,
                imageId,
                target,
                meta: {
                  alt,
                  display,
                  imageId,
                  src,
                  target,
                },
              };
            } catch (error) {
              console.error('Error processing image display link:', error);

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
                raw: match[0],
                alt,
                display,
                imageId,
                target,
                meta: {
                  alt,
                  display,
                  imageId,
                  src: imageId,
                  target,
                },
              };
            }
          }
        },
        renderer: createRenderer(
          SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY_LINK,
          {
            parseChildren: false,
          }
        ),
      },
    ],
  };
};

export default markedImageDisplayLink;
