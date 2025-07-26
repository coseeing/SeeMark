import React from 'react';

const Alert = ({ children, ...props }) => {
  console.log('Alert component props:', props);

  return <div className="alert">{children}</div>;
};

export default Alert;
