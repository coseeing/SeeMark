import React from 'react';
import PropTypes from 'prop-types';

const InternalLinkTitle = ({ display = '', title = '', target = '' }) => {
  return (
    <a
      href={`#${target}`}
      id={`${target}-source`}
      title={title}
      className="underline"
    >
      {display}
    </a>
  );
};

InternalLinkTitle.propTypes = {
  display: PropTypes.string,
  title: PropTypes.string,
  target: PropTypes.string.isRequired,
};

export default InternalLinkTitle;
