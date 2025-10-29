import React from 'react';
import PropTypes from 'prop-types';

const ImageDisplayLink = ({
  alt = '',
  display = '',
  imageId = '',
  src = '',
  target = '',
}) => {
  return (
    <a href={target}>
      <figure>
        <img src={src} alt={alt} data-seemark-image-id={imageId} />
        <figcaption>{display}</figcaption>
      </figure>
    </a>
  );
};

ImageDisplayLink.propTypes = {
  alt: PropTypes.string,
  display: PropTypes.string,
  imageId: PropTypes.string,
  src: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default ImageDisplayLink;
