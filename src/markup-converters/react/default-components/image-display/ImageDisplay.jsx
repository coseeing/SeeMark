import React from 'react';
import PropTypes from 'prop-types';

const ImageDisplay = ({ alt = '', display = '', imageId = '', src = '' }) => {
  return (
    <figure>
      <img src={src} alt={alt} data-seemark-image-id={imageId} />
      <figcaption>{display}</figcaption>
    </figure>
  );
};

ImageDisplay.propTypes = {
  alt: PropTypes.string,
  display: PropTypes.string,
  imageId: PropTypes.string,
  src: PropTypes.string,
};

export default ImageDisplay;
