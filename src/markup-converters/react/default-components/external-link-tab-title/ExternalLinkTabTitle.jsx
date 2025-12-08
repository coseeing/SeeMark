import React from 'react';
import PropTypes from 'prop-types';

const ExternalLinkTabTitle = ({ display = '', title = '', target = '' }) => {
  return (
    <a href={target} title={title} target="_blank" rel="noopener noreferrer">
      {display}
    </a>
  );
};

ExternalLinkTabTitle.propTypes = {
  display: PropTypes.string,
  title: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default ExternalLinkTabTitle;
