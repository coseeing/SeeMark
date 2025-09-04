import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ alt = '', imageId = '', src = '' }) => {
  return <img src={src} alt={alt} data-seemark-image-id={imageId} />;
};

Image.propTypes = {
  alt: PropTypes.string,
  imageId: PropTypes.string,
  src: PropTypes.string,
};

export default Image;
