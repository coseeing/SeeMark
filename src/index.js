const markedProcessorFactory = require('./content-processor/markdown-process');
const textProcessorFactory = require('./content-processor/text-process');
const latexDelimiterConvertor = require('./content-processor/latext-delimiter-convertor');

module.exports = {
  markedProcessorFactory,
  textProcessorFactory,
  latexDelimiterConvertor
};
