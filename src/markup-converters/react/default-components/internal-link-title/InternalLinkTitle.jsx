import React from 'react';
import PropTypes from 'prop-types';

const InternalLinkTitle = ({ display = '', title = '', id = '' }) => {
  return (
    <a href={`#${id}`} id={`${id}-source`} title={title} className="underline">
      {display}
    </a>
  );
};

InternalLinkTitle.propTypes = {
  display: PropTypes.string,
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
};

export default InternalLinkTitle;
