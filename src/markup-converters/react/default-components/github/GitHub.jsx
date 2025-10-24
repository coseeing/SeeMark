import React from 'react';
import PropTypes from 'prop-types';

const GitHub = ({ title = '', source = '' }) => {
  return <iframe title={title} src={source} />;
};

GitHub.propTypes = {
  title: PropTypes.string,
  source: PropTypes.string,
};

export default GitHub;
