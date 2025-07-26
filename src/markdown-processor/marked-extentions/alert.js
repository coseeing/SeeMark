import { SUPPORTED_COMPONENT_TYPES } from '../../shared/supported-components';

import { buildHTMLMarkup } from './helpers';

/**
 * The default configuration for alert variants.
 */
const ALERT_VARIANTS = [
  {
    type: 'note',
  },
  {
    type: 'tip',
  },
  {
    type: 'important',
  },
  {
    type: 'warning',
  },
  {
    type: 'caution',
  },
];

/**
 * Returns regex pattern to match alert syntax.
 */
function createSyntaxPattern(type) {
  return `^(?:\\[!${type.toUpperCase()}])\\s*?\n*`;
}

/**
 * Capitalizes the first letter of a string.
 */
function ucfirst(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1).toLowerCase();
}

function findMatchingVariant(token) {
  return ALERT_VARIANTS.find(({ type }) =>
    new RegExp(createSyntaxPattern(type)).test(token.text)
  );
}

function extractLinkId(token) {
  const alertTypes = ALERT_VARIANTS.map((v) => v.type.toUpperCase()).join('|');
  const regexp = new RegExp(`^\\[!(${alertTypes})\\]#([^\\s]+)\n`);
  const match = token.text.match(regexp);
  return match ? match[2] : null;
}

function createCleanedPatternToken(token) {
  const alertTypes = ALERT_VARIANTS.map((v) => v.type.toUpperCase()).join('|');
  const combinedRegexp = new RegExp(
    `^\\[!(${alertTypes})\\](?:#[^\\s]+)?\\s*?\\n*`
  );

  return {
    ...token,
    raw: token.raw.replace(combinedRegexp, ''),
    text: token.text.replace(combinedRegexp, ''),
    tokens: token.tokens?.map?.((token) => createCleanedPatternToken(token)),
  };
}

function createValidFirstTokens(token) {
  return token && token.type !== 'br' ? [token] : [];
}

function createProcessedFirstLine(firstLine) {
  const [patternToken, firstToken, ...remainingTokens] = firstLine.tokens;

  return {
    ...firstLine,
    tokens: [
      createCleanedPatternToken(patternToken),
      ...createValidFirstTokens(firstToken),
      ...remainingTokens,
    ],
  };
}

function processTokenContent(token, variantType) {
  const typeRegexp = new RegExp(createSyntaxPattern(variantType));
  const [firstLine, ...remainingLines] = token.tokens;

  const cleanedFirstLine = firstLine.raw?.replace(typeRegexp, '').trim();
  if (!cleanedFirstLine) {
    token.tokens = remainingLines;
    return;
  }

  token.tokens = [createProcessedFirstLine(firstLine), ...remainingLines];
}

function markedAlert() {
  return {
    walkTokens(token) {
      if (token.type !== 'blockquote') return;

      const matchedVariant = findMatchingVariant(token);
      if (!matchedVariant) return;

      Object.assign(token, {
        type: SUPPORTED_COMPONENT_TYPES.ALERT,
        meta: {
          variant: matchedVariant.type,
          title: matchedVariant.title || ucfirst(matchedVariant.type),
          internalLinkId: extractLinkId(token),
        },
      });

      if (!Array.isArray(token.tokens)) return;

      processTokenContent(token, matchedVariant.type);
    },
    extensions: [
      {
        name: SUPPORTED_COMPONENT_TYPES.ALERT,
        level: 'block',
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);
          return buildHTMLMarkup(
            SUPPORTED_COMPONENT_TYPES.ALERT,
            meta,
            children
          );
        },
      },
    ],
  };
}

export default markedAlert;
