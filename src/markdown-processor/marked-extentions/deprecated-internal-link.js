const LINK_REGEXP = /^\[([^\]]+)\]<([^>]+)>/;

const LINK_COLOR = 'text-[#58B2DC]';

function markedInternalLink() {
  return {
    extensions: [
      {
        name: 'internalLink-link',
        level: 'inline',
        start(src) {
          return src.match(/\[/)?.index;
        },
        tokenizer(src) {
          const match = src.match(LINK_REGEXP);

          if (match) {
            return {
              type: 'internalLink-link',
              raw: match[0],
              text: match[1],
              id: match[2],
            };
          }
        },
        renderer(token) {
          return `<a href="#${token.id}" id="${token.id}-source" class="underline ${LINK_COLOR}">${token.text}</a>`;
        },
      },
    ],
  };
}

export default markedInternalLink;
