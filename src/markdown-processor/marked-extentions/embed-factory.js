import { buildHTMLMarkup } from './helpers';

/**
 * Generic factory for creating embed extensions with syntax: @{TYPE}[title](source)
 * @param {string} type - The component type (e.g., 'youtube', 'codepen')
 * @returns {Object} Marked extension object
 */
const createEmbedExtension = (type) => {
  const upperType = type.toUpperCase();

  return {
    extensions: [
      {
        name: type,
        level: 'block',
        start(src) {
          return src.match(new RegExp(`@\\{${upperType}\\}`))?.index;
        },
        tokenizer(src) {
          // Match @{TYPE}[title](source) syntax
          const regex = new RegExp(
            `^@\\{${upperType}\\}\\[([^\\]]*)\\]\\(([^)]+)\\)`
          );
          const match = src.match(regex);

          if (match) {
            return {
              type: type,
              raw: match[0],
              meta: {
                title: match[1] || '',
                source: match[2] || '',
              },
              tokens: [],
            };
          }
        },
        renderer({ meta, tokens = [] }) {
          const children = this.parser.parse(tokens);
          return buildHTMLMarkup(type, meta, children);
        },
      },
    ],
  };
};

export default createEmbedExtension;
