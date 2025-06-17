const createMarkdownParser = ({
  options = {
    latexDelimiter: null,
    asciimathDelimiter: null,
    htmlMathDisplay: null,
    imageFiles: null,
  },
  components,
}) => {
  const parseMarkdown = () => {
    // use options and components
    console.log('Options:', options);
    console.log('Components:', components);
  };

  return parseMarkdown;
};

export default createMarkdownParser;
