const DEFAULT_OPTINOS = {
  latexDelimiter: 'bracket',
  documentFormat: 'inline',
  imageFiles: null,
};

export const createMarkdownParserOptions = (options = DEFAULT_OPTINOS) => {
  return {
    ...DEFAULT_OPTINOS,
    ...options,
  };
};
