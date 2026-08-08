/**
 * Matches an image id that is actually an absolute http(s) URL.
 * Such ids are used verbatim as the image source instead of being looked up
 * in the local imageFiles map.
 */
const URL_REGEXP = /^https?:/i;

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

// Shared across every image extension so the same imageId always resolves to
// the same object URL, regardless of which syntax referenced it.
const blobUrlManager = createBlobUrlManager();

/**
 * Resolves the source for an image reference.
 *
 * - http(s) URLs are used as-is.
 * - Otherwise the id is looked up in imageFiles, and turned into a cached
 *   object URL when shouldBuildImageObjectURL is set (editor preview);
 *   the raw file is returned otherwise.
 *
 * @param {string} imageId - The image id or URL from the markdown source
 * @param {Object} options
 * @param {Object} options.imageFiles - Map of image id to File/Blob
 * @param {boolean} options.shouldBuildImageObjectURL - Build object URLs for local files
 * @returns {string|File|Blob|undefined} The resolved image source
 */
export const resolveImageSource = (
  imageId,
  { imageFiles, shouldBuildImageObjectURL }
) => {
  if (URL_REGEXP.test(imageId)) {
    return imageId;
  }

  const imageFile = imageFiles[imageId];

  return shouldBuildImageObjectURL
    ? blobUrlManager(imageId, imageFile)
    : imageFile;
};
