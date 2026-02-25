import React from 'react';
import PropTypes from 'prop-types';

const ImageDisplayLink = ({
  alt = '',
  display = '',
  imageId = '',
  source = '',
  target = '',
}) => {
  return (
    <a href={target}>
      <figure>
        <img src={source} alt={alt} data-seemark-image-id={imageId} />
        <figcaption>{display}</figcaption>
      </figure>
    </a>
  );
};

ImageDisplayLink.propTypes = {
  alt: PropTypes.string,
  display: PropTypes.string,
  imageId: PropTypes.string,
  source: PropTypes.string,
  target: PropTypes.string.isRequired,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default ImageDisplayLink;
