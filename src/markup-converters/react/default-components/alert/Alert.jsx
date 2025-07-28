import React from 'react';

const Alert = ({ children, ...props }) => {
  return <div className="alert">{children}</div>;
};

export default Alert;
