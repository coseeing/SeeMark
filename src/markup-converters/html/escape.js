// HTML escape utilities for the HTML adapter.
//
// These are used internally by default components and exposed via
// @coseeing/see-mark/html/utils for consumers writing custom components.

export const escapeHtml = (value) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// For attribute values inside double-quoted attributes.
// Mirrors escapeHtml; named separately for call-site clarity.
export const escapeAttr = escapeHtml;

// Match URL scheme (letter-led, followed by ":") at the start of the string.
const SCHEME_PATTERN = /^([a-z][a-z0-9+.-]*):/i;

// Browsers ignore ASCII tab/newline/CR (and other C0 controls / DEL) inside
// URLs, so `java\tscript:alert(1)` is parsed as `javascript:`. We strip them
// before scheme detection so the allowlist check sees what the browser sees —
// otherwise an embedded control char breaks the scheme regex and the value is
// wrongly treated as a safe relative URL.
const CONTROL_CHARS = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
  'g'
);

// Whitelist of safe schemes. Schemes outside this set (e.g., javascript:,
// data:, vbscript:, file:) are rejected. URLs without a scheme are treated as
// relative and accepted.
const SAFE_SCHEMES = new Set([
  'http',
  'https',
  'mailto',
  'tel',
  'ftp',
  'sftp',
  'blob',
]);

export const safeUrl = (value) => {
  if (value === undefined || value === null) return '#';
  const trimmed = String(value).replace(CONTROL_CHARS, '').trim();
  if (trimmed === '') return '#';
  const match = trimmed.match(SCHEME_PATTERN);
  if (match) {
    if (SAFE_SCHEMES.has(match[1].toLowerCase())) return escapeAttr(trimmed);
    return '#';
  }
  // No scheme — relative URL, fragment, or query. Safe.
  return escapeAttr(trimmed);
};
