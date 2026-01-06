import React from 'react';
import PropTypes from 'prop-types';

const ExternalLinkTab = ({ display = '', target = '' }) => {
  return (
    <a href={target} target="_blank" rel="noopener noreferrer">
      {display}
    </a>
  );
};

ExternalLinkTab.propTypes = {
  display: PropTypes.string,
  target: PropTypes.string.isRequired,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default ExternalLinkTab;
