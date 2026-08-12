const DEFAULT_OPTINOS = {
  enableLatex: true,
  enableNemeth: true,
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
