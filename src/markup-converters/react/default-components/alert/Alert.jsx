import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ children, internalLinkId = '', variant = '', title = '' }) => {
  const showBacklink = !!internalLinkId;

  return (
    <div role="region" aria-label={title} id={internalLinkId}>
      <p>{variant.toUpperCase()}</p>
      {children}
      {showBacklink && <a href={`#${internalLinkId}-source`}>back</a>}
    </div>
  );
};

export default Alert;

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  internalLinkId: PropTypes.string,
  variant: PropTypes.string,
  title: PropTypes.string,
};
