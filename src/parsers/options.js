const DEFAULT_OPTINOS = {
  latexDelimiter: 'bracket',
  documentFormat: 'inline',
  imageFiles: null,
  shouldBuildImageObjectURL: false,
};

export const createMarkdownParserOptions = (options = DEFAULT_OPTINOS) => {
  return {
    ...DEFAULT_OPTINOS,
    ...options,
  };
};
