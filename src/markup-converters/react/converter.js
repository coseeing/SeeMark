import parse from 'html-react-parser';

const convertMarkup = (markup = '', components = {}, options = {}) => {
  // TODO: handle components and options

  return parse(markup);
};

export default convertMarkup;
