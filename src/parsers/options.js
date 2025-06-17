// TODO: update the default options
const DEFAULT_OPTINOS = {
  latexDelimiter: null,
  asciimathDelimiter: null,
  htmlMathDisplay: null,
  imageFiles: null,
};

export const createMarkdownParserOptions = (options = DEFAULT_OPTINOS) => {
  return {
    ...DEFAULT_OPTINOS,
    ...options,
  };
};
