import { Marked } from 'marked';

import { createPositionTracker } from './position-tracker';

// Strip SeeMark's dispatch attributes from USER-authored raw HTML. The Stage 1
// extension renderers emit `data-seemark-element-type` / `data-seemark-payload`
// placeholders that the adapters expand into components; if a user could smuggle
// those attributes via raw HTML in their markdown, they could forge a component
// (notably `math`, whose payload is emitted as live HTML) and inject script.
// Neutralizing the forgery here protects every adapter at the source. Genuine
// placeholders come from extension renderer output (not `html` tokens), so they
// are unaffected.
const SEEMARK_ATTR_PATTERN =
  /\s+data-seemark-(?:element-type|payload)\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+)/gi;

const stripSeemarkAttrs = (token) => {
  const raw =
    typeof token === 'string' ? token : (token?.text ?? token?.raw ?? '');
  return raw.replace(SEEMARK_ATTR_PATTERN, '');
};

const markedProcessorFactory = ({
  enableLatex = true,
  enableAsciimath = true,
  latexDelimiter,
  asciimathDelimiter,
  nemethDelimiter,
  documentFormat,
  imageFiles = {},
  shouldBuildImageObjectURL = false,
  extensions = [],
}) => {
  const marked = new Marked();

  const positionTracker = createPositionTracker();

  marked.use({
    breaks: true,
    hooks: {
      preprocess: positionTracker.preprocess,
    },
    walkTokens: positionTracker.walkTokens,
    renderer: {
      html(token) {
        return stripSeemarkAttrs(token);
      },
    },
  });

  extensions.forEach((extension) => {
    marked.use(
      extension({
        enableLatex,
        enableAsciimath,
        latexDelimiter,
        asciimathDelimiter,
        nemethDelimiter,
        documentFormat,
        imageFiles,
        shouldBuildImageObjectURL,
      })
    );
  });

  return {
    parse: (raw) => marked.parse(raw),
    lexer: (raw) => marked.lexer(raw),
  };
};

export default markedProcessorFactory;
