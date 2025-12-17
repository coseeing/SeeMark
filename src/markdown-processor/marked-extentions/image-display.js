import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { createRenderer } from './helpers';

/**
 * Matches image with display text syntax: ![alt][[display]](imageId)
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
 *
 * Example match: ![Company logo][[Our brand identity]](logo-2024)
 * - match[1] = "Company logo" (alt)
 * - match[2] = "Our brand identity" (display)
 * - match[3] = "logo-2024" (imageId)
 */
// Regex exported for test
export const IMAGE_DISPLAY_REGEXP = /^!\[([^\]]*)\]\[\[([^\]]+)\]\]\(([^)]+)\)/;

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

const markedImageDisplay = ({ imageFiles, shouldBuildImageObjectURL }) => {
  return {
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
        level: 'inline',
        start(src) {
          return src.match(/!\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(IMAGE_DISPLAY_REGEXP);

          if (match) {
            const alt = match[1];
            const display = match[2];
            const imageId = match[3];

            try {
              const imageFile = imageFiles[imageId];
              const src = shouldBuildImageObjectURL
                ? blobUrlManager(imageId, imageFile)
                : imageFile;

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
                raw: match[0],
                alt,
                display,
                imageId,
                meta: {
                  alt,
                  display,
                  imageId,
                  src,
                },
              };
            } catch (error) {
              console.error('Error processing image display:', error);

              return {
                type: SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY,
                raw: match[0],
                alt,
                display,
                imageId,
                meta: {
                  alt,
                  display,
                  imageId,
                  src: imageId,
                },
              };
            }
          }
        },
        renderer: createRenderer(SUPPORTED_COMPONENT_TYPES.IMAGE_DISPLAY, {
          parseChildren: false,
        }),
      },
    ],
  };
};

export default markedImageDisplay;
