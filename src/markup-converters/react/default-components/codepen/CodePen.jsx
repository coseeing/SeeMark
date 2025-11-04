import React from 'react';
import PropTypes from 'prop-types';

const CodePen = ({ title, source }) => {
  // adpated from CodePen official embed
  return (
    <iframe
      height="300"
      style={{ width: '100%' }}
      scrolling="no"
      title={title}
      src={source}
      frameBorder="no"
      loading="lazy"
      // eslint-disable-next-line react/no-unknown-property
      allowTransparency="true"
    />
  );
};

CodePen.propTypes = {
  title: PropTypes.string,
  source: PropTypes.string,
};

export default CodePen;
