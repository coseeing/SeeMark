import { escapeAttr, safeUrl } from './escape';

// Security policy for raw HTML that passes through Stage 1 verbatim (e.g.,
// <script>, <img onerror=...> written directly in the markdown source).
//
// Since the HTML adapter's output is assigned to innerHTML (or jQuery .html(),
// document.write, etc.) by the consumer, we must neutralize the dangerous
// parts — otherwise the adapter would be strictly more dangerous than the
// React adapter (which drops on* handlers and never executes vDOM scripts).
// This is "safe by default"; the optional sanitize hook covers stricter needs.
//
// The converter consumes this policy when serializing passthrough nodes;
// component output is NOT re-walked, so nothing here affects what default or
// custom components emit (e.g. the youtube component's <iframe>).

// Tags that should never be re-emitted from untrusted passthrough markup.
export const DROPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'meta',
  'base',
  'form',
  'link',
]);

// Attributes carrying URLs; their values run through safeUrl on passthrough.
const URL_ATTRS = new Set([
  'href',
  'src',
  'xlink:href',
  'action',
  'poster',
  'srcset',
]);

// Attributes that enable script execution / navigation hijacking even when the
// value is HTML-escaped (srcdoc is re-parsed as HTML; http-equiv can refresh;
// formaction/ping/background trigger requests). Dropped from passthrough.
const DROPPED_ATTRS = new Set([
  'srcdoc',
  'formaction',
  'http-equiv',
  'ping',
  'background',
]);

// An attribute is unsafe if it is an event handler (on*) or one of the
// navigation/refresh vectors in DROPPED_ATTRS. `lower` is the lower-cased name.
const isUnsafeAttrName = (lower) =>
  lower.startsWith('on') || DROPPED_ATTRS.has(lower);

// Serialize a passthrough element's attributes with the policy applied:
// unsafe attributes are dropped, URL attributes are sanitized, everything
// else is attribute-escaped.
export const serializeAttrs = (attribs) => {
  if (!attribs) return '';
  return Object.entries(attribs)
    .map(([k, v]) => {
      const lower = k.toLowerCase();
      if (isUnsafeAttrName(lower)) return '';
      const value = URL_ATTRS.has(lower) ? safeUrl(v) : escapeAttr(v);
      return ` ${k}="${value}"`;
    })
    .join('');
};
