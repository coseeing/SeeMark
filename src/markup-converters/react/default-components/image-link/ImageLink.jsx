import React from 'react';
import PropTypes from 'prop-types';

const ImageLink = ({ alt = '', imageId = '', source = '', target = '' }) => {
  return (
    <a href={target}>
      <img src={source} alt={alt} data-seemark-image-id={imageId} />
    </a>
  );
};

ImageLink.propTypes = {
  alt: PropTypes.string,
  imageId: PropTypes.string,
  source: PropTypes.string,
  target: PropTypes.string.isRequired,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default ImageLink;
