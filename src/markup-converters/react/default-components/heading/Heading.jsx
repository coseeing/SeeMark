import React from 'react';
import PropTypes from 'prop-types';

// text prop is available for custom implementations (e.g., search indexing, accessibility)
const Heading = ({ children, id = null, level = 1 }) => {
  const Tag = `h${level}`;

  return <Tag id={id || undefined}>{children}</Tag>;
};

Heading.propTypes = {
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
  text: PropTypes.string,
  position: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number }),
};

export default Heading;
