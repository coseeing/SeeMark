import parse from 'html-react-parser';

const convertMarkup = (markup = '', components = {}, options = {}) => {
  // TODO: handle components and options

  console.log('Converting markup to React components with options:', options);
  console.log('Using components:', components);
  console.log('Markup:', markup);

  return parse(markup);
};

export default convertMarkup;
