import React from 'react';
import PropTypes from 'prop-types';

const ExternalLinkTitle = ({ display = '', title = '', target = '' }) => {
  return (
    <a href={target} title={title}>
      {display}
    </a>
  );
};

ExternalLinkTitle.propTypes = {
  display: PropTypes.string,
  title: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default ExternalLinkTitle;
