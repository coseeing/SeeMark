const markdownProcessor = (markdownContent = '', options = {}) => {
  console.log('Processing markdown content with options:', options);
  return `<div data-seemark-type="image">${markdownContent}</div>`;
};

export default markdownProcessor;
