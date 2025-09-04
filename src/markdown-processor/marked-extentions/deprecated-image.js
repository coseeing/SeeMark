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

const markedImage = ({ imageFiles }) => {
  const renderer = {
    image(token) {
      try {
        // TODO: reconsider to remove this logic
        if (!imageFiles) {
          // For HTML render
          const imageId = token.href.split('/').pop();
          const imageExt = window.contentConfig.images[imageId];
          return `<img src="./images/${imageExt}" alt="${token.text}" data-seemark-image-id="${imageId}">`;
        }

        // For editor preview
        const imageFile = imageFiles[token.href];
        const blobUrl = blobUrlManager(token.href, imageFile);
        return `<img src="${blobUrl}" alt="${token.text}" data-seemark-image-id="${token.href}">`;
      } catch (error) {
        console.error('Error processing image:', error);
        return `<img src="${token.href}" alt="${token.text}" data-seemark-image-id="${token.href}">`;
      }
    },
  };
  return { renderer };
};

export default markedImage;
