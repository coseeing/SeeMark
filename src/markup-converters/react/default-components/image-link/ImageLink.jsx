import React from 'react';
import PropTypes from 'prop-types';

const ImageLink = ({ alt = '', imageId = '', src = '', target = '' }) => {
  return (
    <a href={target}>
      <img src={src} alt={alt} data-seemark-image-id={imageId} />
    </a>
  );
};

ImageLink.propTypes = {
  alt: PropTypes.string,
  imageId: PropTypes.string,
  src: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default ImageLink;
