import React from 'react';
import PropTypes from 'prop-types';

const Iframe = ({ title, source }) => {
  return <iframe title={title} src={source} />;
};

Iframe.propTypes = {
  title: PropTypes.string,
  source: PropTypes.string,
};

export default Iframe;
