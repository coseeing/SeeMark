import React from 'react';
import PropTypes from 'prop-types';

const InternalLink = ({ display = '', target = '' }) => {
  return (
    <a href={`#${target}`} id={`${target}-source`} className="underline">
      {display}
    </a>
  );
};

InternalLink.propTypes = {
  display: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default InternalLink;
