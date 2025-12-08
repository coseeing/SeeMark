import React from 'react';
import PropTypes from 'prop-types';

const YouTube = ({ title, source }) => {
  // adapted from YouTube official embed
  return (
    <iframe
      width="560"
      height="315"
      src={source}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
};

YouTube.propTypes = {
  title: PropTypes.string,
  source: PropTypes.string,
};

export default YouTube;
