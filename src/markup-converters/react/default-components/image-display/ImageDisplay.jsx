import React from 'react';
import PropTypes from 'prop-types';

const ImageDisplay = ({
  alt = '',
  display = '',
  imageId = '',
  source = '',
}) => {
  return (
    <figure>
      <img src={source} alt={alt} data-seemark-image-id={imageId} />
      <figcaption>{display}</figcaption>
    </figure>
  );
};

ImageDisplay.propTypes = {
  alt: PropTypes.string,
  display: PropTypes.string,
  imageId: PropTypes.string,
  source: PropTypes.string,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default ImageDisplay;
