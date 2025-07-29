import React from 'react';
import PropTypes from 'prop-types';

const InternalLink = ({ text = '', id = '' }) => {
  return (
    <a href={`#${id}`} id={`${id}-source`} class="underline">
      {text}
    </a>
  );
};

InternalLink.propTypes = {
  text: PropTypes.string,
  id: PropTypes.string.isRequired,
};

export default InternalLink;
