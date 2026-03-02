import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ alt = '', imageId = '', source = '' }) => {
  return <img src={source} alt={alt} data-seemark-image-id={imageId} />;
};

Image.propTypes = {
  alt: PropTypes.string,
  imageId: PropTypes.string,
  source: PropTypes.string,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default Image;
