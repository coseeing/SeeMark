import { escapeHtml, escapeAttr } from '../escape';

const alert = (
  { internalLinkId = '', variant = '', title = '' },
  childrenHtml = ''
) => {
  const idAttr = internalLinkId ? ` id="${escapeAttr(internalLinkId)}"` : '';
  const backlink = internalLinkId
    ? `<a href="#${escapeAttr(internalLinkId)}-source">back</a>`
    : '';
  return `<div role="region" aria-label="${escapeAttr(title)}"${idAttr}><p>${escapeHtml(variant.toUpperCase())}</p>${childrenHtml}${backlink}</div>`;
};

export default alert;
