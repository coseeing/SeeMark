// Scope note: these provide *correct escaping* (so a value cannot break out of
// its text/attribute context), NOT sanitization. The HTML adapter deliberately
// does not scheme-filter URLs or strip dangerous tags — see the README threat
// model. Untrusted input should be passed through DOMPurify via the `sanitize`
// hook.

export const escapeHtml = (value) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Named separately from escapeHtml for call-site clarity.
export const escapeAttr = escapeHtml;
