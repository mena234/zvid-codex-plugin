const Joi = require('joi');
const net = require('net');
const path = require('path');
const { parseDocument } = require('htmlparser2');
const planLimitsService = require('../services/planLimitsService');

// --- limits (tune for your product) ---
const MAX_TEXT_LEN = 20_000;
const MAX_HTML_LEN = 200_000;
const MAX_NAME_LEN = 1000;
const MAX_ID_LEN = 100;
const MAX_STYLE_PROPS = 120;
const MAX_STYLE_VALUE_LEN = 4000;
const MAX_SVG_CHARS = 200_000; // tune
const MAX_SVG_DIMENSION = 4096; // tune (or use your limits.maxInputResolution)
const MAX_SUBTITLE_WORD_LEN = 100;
const MAX_SUBTITLE_TEXT_LEN = 1000;
const MAX_FONT_SIZE = 1000;
const MAX_OUTLINE_WIDTH = 100;
// --- generic guards ---
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

const URL_CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

// Prevent breaking out of <style> or injecting extra declarations/rules
const CSS_BREAKOUT = /<\/style|<|>|[;{}]/i;

// Prevent CSS-triggered fetches / indirection (keep var() if you truly need it)
const CSS_DANGEROUS_TOKENS =
  /url\s*\(|@import|image-set\s*\(|-webkit-image-set\s*\(|expression\s*\(|javascript:/i;

// Keys you never want in objects (proto pollution etc.)
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

// You allow ANY property name, but keep it syntactically reasonable.
// (You convert camelCase to kebab-case later anyway.)
const CSS_PROP_NAME = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

const ID_REGEX = new RegExp('^[a-zA-Z0-9_-]+$');

const NAME_REGEX = new RegExp('^[a-zA-Z0-9_\\- ]+$');
const REDIRECT_INTENTS = [
  'api-keys',
  'car',
  'editor',
  'pricing',
  'settings',
  'videos',
];

// Blocks common “external reference” + active content patterns
const SVG_FORBIDDEN = new RegExp(
  [
    // active content / HTML embedding
    '<\\s*script\\b',
    '<\\s*foreignObject\\b',
    'on\\w+\\s*=', // onload= onclick= etc.
    // external refs (SSRF / file reads)
    '\\b(?:xlink:href|href)\\s*=',
    '\\bxmlns:xlink\\b', // often used with xlink:href
    '\\burl\\s*\\(', // paint servers can reference external resources
    '@import\\b',
    '\\bfile\\s*:',
    '\\bhttps?\\s*:',
    '\\bdata\\s*:', // data: can be abused (huge payloads)
  ].join('|'),
  'i'
);

const SVG_FORBIDDEN_TAGS = [
  'script',
  'foreignObject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
];

const SVG_FORBIDDEN_ATTR_PREFIX = ['on']; // onclick, onload, ...
const SVG_URI_ATTRS = ['href', 'xlink:href', 'src']; // if present, must be safe

const CSS_DANGEROUS_GLOBAL = [
  // SSRF / network fetch / external resource loads
  /\burl\s*\(/i,
  /\b@import\b/i,
  /\bimage-set\s*\(/i,

  // legacy / script-adjacent CSS
  /\bexpression\s*\(/i, // old IE
  /\bbehavior\s*:/i, // old IE
  /\b-moz-binding\b/i, // old Firefox

  // obfuscation / hiding
  /\/\*/i, // block CSS comments (optional, helps prevent hiding tokens)
];

// optional "bad behavior" controls (toggle if you want)
// these are NOT SSRF, but can be used for abusive overlays.
// If you want full freedom, leave empty.
// If you want to stop "cover the screen", enable these.
const CSS_PER_PROPERTY_DENY = {
  // position: [/^\s*fixed\s*$/i, /^\s*sticky\s*$/i],
  // "z-index": [(v) => Number(String(v).trim()) > 9999],
};

// User registration validation
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
      )
    )
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name cannot exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Last name is required',
    'string.max': 'Last name cannot exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  redirectIntent: Joi.string().valid(...REDIRECT_INTENTS),
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  redirectIntent: Joi.string().valid(...REDIRECT_INTENTS),
});

// Password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
      )
    )
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

// Reset password validation
const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required',
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
      )
    )
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base':
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

// API key creation validation
const createApiKeySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'API key name is required',
    'string.max': 'API key name cannot exceed 100 characters',
    'any.required': 'API key name is required',
  }),
});

// API key update validation
const updateApiKeySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'API key name is required',
    'string.max': 'API key name cannot exceed 100 characters',
    'any.required': 'API key name is required',
  }),
});

/** helpers */
const hexColor = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

// Hex with optional alpha (e.g. #000000 or #00000030)
const hexColorWithAlpha = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

const positionPreset = Joi.string().valid(
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-center',
  'center-right',
  'bottom-right',
  'bottom-center',
  'bottom-left',
  'custom'
);

const anchor = Joi.string().valid(
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-center',
  'center-right',
  'bottom-right',
  'bottom-center',
  'bottom-left',
  'custom'
);

const resizeMode = Joi.string().valid('contain', 'cover');

const resolutionPreset = Joi.string().valid(
  'sd',
  'hd',
  'full-hd',
  'squared',
  'youtube-short',
  'youtube-video',
  'tiktok',
  'instagram-reel',
  'instagram-post',
  'instagram-story',
  'instagram-feed',
  'twitter-landscape',
  'twitter-portrait',
  'twitter-square',
  'facebook-video',
  'facebook-story',
  'facebook-post',
  'snapchat',
  'custom'
);
const xfadeEffect = Joi.string().valid(
  'fade',
  'fadeblack',
  'fadewhite',
  'wipeleft',
  'wiperight',
  'wipeup',
  'wipedown',
  'slideleft',
  'slideright',
  'slideup',
  'slidedown',
  'smoothleft',
  'smoothright',
  'smoothup',
  'smoothdown',
  'circlecrop',
  'rectcrop',
  'circleclose',
  'circleopen',
  'horzclose',
  'horzopen',
  'vertclose',
  'vertopen',
  'diagbl',
  'diagbr',
  'diagtl',
  'diagtr',
  'hlslice',
  'hrslice',
  'vuslice',
  'vdslice',
  'dissolve',
  'pixelize',
  'radial',
  'hblur',
  'wipetl',
  'wipetr',
  'wipebl',
  'wipebr',
  'fadegrays'
);

const chromaKeySchema = Joi.object({
  color: Joi.string().pattern(hexColor).required(),
  similarity: Joi.number().min(0).max(100),
  blend: Joi.number().min(0).max(100),
});

const filterSchema = Joi.object({
  brightness: Joi.number().min(-100).max(100),
  contrast: Joi.number().min(-100).max(100),
  saturate: Joi.number().min(-100).max(100),
  'hue-rotate': Joi.string().min(0).max(360),
  blur: Joi.string().min(0).max(100),
  invert: Joi.boolean(),
  colorTint: Joi.string().pattern(hexColor),
}).unknown(false);

let sanitizeHtml;
try {
  sanitizeHtml = require('sanitize-html');
} catch {
  sanitizeHtml = null;
}

function isValidCssPropName(prop) {
  return prop.startsWith('--')
    ? CSS_VAR_NAME.test(prop)
    : CSS_PROP_NAME.test(prop);
}

// -------------------- constants you already have --------------------
// Make sure these exist in your file (kept here as references):
// const MAX_STYLE_VALUE_LEN = ...
// const MAX_STYLE_PROPS = ...
// const MAX_TEXT_LEN = ...
// const MAX_HTML_LEN = ...
// const CONTROL_CHARS = ...
// const CSS_PROP_NAME = ...
// const FORBIDDEN_KEYS = new Set(...)

// -------------------- helpers: robust CSS parsing --------------------
function splitStyleDeclarations(style) {
  const s = String(style || '');
  const out = [];
  let buf = '';
  let quote = null; // "'" | '"' | null
  let depth = 0; // parentheses depth

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (quote) {
      buf += ch;
      if (ch === quote && s[i - 1] !== '\\') quote = null;
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }

    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ';' && depth === 0) {
      const trimmed = buf.trim();
      if (trimmed) out.push(trimmed);
      buf = '';
      continue;
    }

    buf += ch;
  }

  const last = buf.trim();
  if (last) out.push(last);
  return out;
}

function splitPropValue(decl) {
  let quote = null;
  let depth = 0;

  for (let i = 0; i < decl.length; i++) {
    const ch = decl[i];

    if (quote) {
      if (ch === quote && decl[i - 1] !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ':' && depth === 0) {
      const prop = decl.slice(0, i).trim();
      const value = decl.slice(i + 1).trim();
      return [prop, value];
    }
  }
  return [null, null];
}

function validateCssDenylistValue(rawValue, helpers) {
  const s = String(rawValue);

  if (CONTROL_CHARS.test(s)) {
    return helpers.error('any.invalid', {
      reason: 'Control characters in CSS value',
    });
  }

  // hard deny patterns (SSRF + script-adjacent + obfuscation)
  for (const rx of CSS_DANGEROUS_GLOBAL) {
    if (rx.test(s)) {
      return helpers.error('any.invalid', {
        reason: `Dangerous CSS token detected`,
      });
    }
  }

  // length cap for safety
  if (s.length > MAX_STYLE_VALUE_LEN) {
    return helpers.error('any.invalid', { reason: 'CSS value too long' });
  }

  return rawValue;
}

// -------------------- STYLE value validator (string or number) --------------------
const cssValueSchema = Joi.alternatives()
  .try(Joi.number(), Joi.string().max(MAX_STYLE_VALUE_LEN))
  .custom((v, helpers) => {
    // Normalize to string for checks (numbers become "123")
    const s = String(v);

    // Basic controls
    if (CONTROL_CHARS.test(s))
      return helpers.error('any.invalid', { reason: 'Control chars' });

    // Denylist checks for SSRF / dangerous CSS
    for (const rx of CSS_DANGEROUS_GLOBAL) {
      if (rx.test(s))
        return helpers.error('any.invalid', { reason: 'Dangerous CSS token' });
    }

    // Optional: block CSS breakouts if you previously had these
    // (Keep your old regex if it’s still useful)
    // if (CSS_BREAKOUT.test(s)) return helpers.error("any.invalid", { reason: "CSS breakout" });

    return v;
  }, 'Safe CSS value')
  .messages({ 'any.invalid': '{{#reason}}' });

// -------------------- STYLE object validator --------------------
const safeStyleSchema = Joi.object()
  .max(MAX_STYLE_PROPS)
  .unknown(true) // no allowlist for properties
  .custom((obj, helpers) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return helpers.error('any.invalid', {
        reason: 'Style must be an object',
      });
    }

    for (const [k, v] of Object.entries(obj)) {
      if (FORBIDDEN_KEYS.has(k))
        return helpers.error('any.invalid', { reason: `Forbidden key: ${k}` });
      if (!isValidCssPropName(k))
        return helpers.error('any.invalid', {
          reason: `Invalid CSS property name: ${k}`,
        });

      // Disallow null/undefined (you skip them in the builder anyway)
      if (v === null || v === undefined) continue;

      // validate the value with denylist
      const { error } = cssValueSchema.validate(v);
      if (error) return helpers.error('any.invalid', { reason: error.message });

      // Optional per-property deny controls (bad behavior)
      const deny = CSS_PER_PROPERTY_DENY[k.toLowerCase()];
      if (deny) {
        const valueStr = String(v).trim();
        for (const rule of deny) {
          if (rule instanceof RegExp && rule.test(valueStr)) {
            return helpers.error('any.invalid', {
              reason: `Value not allowed for "${k}"`,
            });
          }
          if (typeof rule === 'function' && rule(valueStr)) {
            return helpers.error('any.invalid', {
              reason: `Value not allowed for "${k}"`,
            });
          }
        }
      }
    }

    return obj;
  }, 'Safe style object')
  .messages({ 'any.invalid': '{{#reason}}' });

// -------------------- Plain text: must be text (no HTML injection) --------------------
const safeTextSchema = Joi.string()
  .allow('')
  .max(MAX_TEXT_LEN)
  .custom((v, helpers) => {
    if (CONTROL_CHARS.test(v))
      return helpers.error('any.invalid', { reason: 'Control chars' });

    // Since you inject into HTML without escaping, reject any markup.
    if (/[<>]/.test(v))
      return helpers.error('any.invalid', {
        reason: 'HTML markup not allowed in text',
      });

    return v;
  }, 'Safe text')
  .messages({ 'any.invalid': '{{#reason}}' });

// -------------------- HTML: validate (reject invalid/unsafe) --------------------
const ALLOWED_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'br',
  'span',
  'div',
  'p',
  'ul',
  'ol',
  'li',
]);

// Only allow style attribute (you can add "class" later if you validate class values)
const ALLOWED_ATTRS = new Set(['style']);

function validateInlineStyleAttr(style, helpers) {
  const s = String(style || '');

  if (CONTROL_CHARS.test(s)) {
    return helpers.error('any.invalid', {
      reason: 'Control characters in style',
    });
  }

  // global denylist scan
  for (const rx of CSS_DANGEROUS_GLOBAL) {
    if (rx.test(s))
      return helpers.error('any.invalid', {
        reason: 'Dangerous CSS in style attribute',
      });
  }

  // Parse declarations and validate structure (so invalid CSS becomes an error)
  const decls = splitStyleDeclarations(s);
  for (const decl of decls) {
    const [prop, value] = splitPropValue(decl);
    if (!prop || !value) {
      return helpers.error('any.invalid', {
        reason: `Invalid CSS declaration: "${decl}"`,
      });
    }
    const propName = prop.trim();

    // Basic prop-name validation (same as your object style)
    if (!isValidCssPropName(propName)) {
      return helpers.error('any.invalid', {
        reason: `Invalid CSS property name: "${propName}"`,
      });
    }

    // Validate value denylist again (more granular)
    const maybeErr = validateCssDenylistValue(value, helpers);
    if (maybeErr?.isJoi) return maybeErr;

    // Optional per-property deny controls (bad behavior)
    const deny = CSS_PER_PROPERTY_DENY[propName.toLowerCase()];
    if (deny) {
      for (const rule of deny) {
        if (rule instanceof RegExp && rule.test(value)) {
          return helpers.error('any.invalid', {
            reason: `Value not allowed for "${propName}"`,
          });
        }
        if (typeof rule === 'function' && rule(value)) {
          return helpers.error('any.invalid', {
            reason: `Value not allowed for "${propName}"`,
          });
        }
      }
    }
  }

  return style;
}

function validateHtmlTree(html, helpers) {
  const doc = parseDocument(html, {
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
    recognizeSelfClosing: true,
  });

  function walk(node) {
    if (!node) return null;

    if (node.type === 'tag') {
      const tag = node.name?.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        return helpers.error('any.invalid', {
          reason: `Tag not allowed: <${tag}>`,
        });
      }

      const attrs = node.attribs || {};
      for (const [kRaw, v] of Object.entries(attrs)) {
        const k = kRaw.toLowerCase();

        // block JS/event handlers
        if (k.startsWith('on')) {
          return helpers.error('any.invalid', {
            reason: `Event attribute not allowed: ${k}`,
          });
        }

        if (!ALLOWED_ATTRS.has(k)) {
          return helpers.error('any.invalid', {
            reason: `Attribute not allowed: ${k}`,
          });
        }

        if (k === 'style') {
          const maybe = validateInlineStyleAttr(v, helpers);
          if (maybe?.isJoi) return maybe;
        }
      }
    }

    for (const c of node.children || []) {
      const err = walk(c);
      if (err) return err;
    }
    return null;
  }

  for (const c of doc.children || []) {
    const err = walk(c);
    if (err) return err;
  }
  return null;
}

const safeHtmlSchema = Joi.string()
  .allow('')
  .max(MAX_HTML_LEN)
  .custom((v, helpers) => {
    if (CONTROL_CHARS.test(v))
      return helpers.error('any.invalid', { reason: 'Control chars' });

    // hard-block script/style tags (even if not in allowlist, make error explicit)
    if (/<\s*script\b/i.test(v) || /<\/\s*script\s*>/i.test(v)) {
      return helpers.error('any.invalid', { reason: '<script> not allowed' });
    }
    if (/<\s*style\b/i.test(v) || /<\/\s*style\s*>/i.test(v)) {
      return helpers.error('any.invalid', { reason: '<style> not allowed' });
    }

    // validate structure + denylist CSS
    const err = validateHtmlTree(v, helpers);
    if (err) return err;

    return v; // keep original, do not sanitize/strip
  }, 'Safe html (denylist CSS + reject invalid)')
  .messages({ 'any.invalid': '{{#reason}}' })
  .default('');

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (
    parts.length !== 4 ||
    parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)
  )
    return false;

  const [a, b] = parts;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 169.254.0.0/16 (link-local)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  return false;
}

function isPrivateIPv6(ip) {
  const v = ip.toLowerCase();
  // loopback ::1, unspecified ::, link-local fe80::/10, unique-local fc00::/7
  return (
    v === '::1' ||
    v === '::' ||
    v.startsWith('fe8') ||
    v.startsWith('fe9') ||
    v.startsWith('fea') ||
    v.startsWith('feb') ||
    v.startsWith('fc') ||
    v.startsWith('fd')
  );
}

function makeRemoteSrcSchema({ allowedExts = null } = {}) {
  return Joi.string()
    .trim()
    .min(1)
    .max(2048)
    .custom((value, helpers) => {
      // quick rejects
      if (URL_CONTROL_CHARS.test(value)) return helpers.error('any.invalid');
      if (/[\\\s]/.test(value)) return helpers.error('any.invalid'); // no backslashes / spaces

      let u;
      try {
        u = new URL(value);
      } catch {
        return helpers.error('any.invalid');
      }

      // allow only http/https
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        return helpers.error('any.invalid');
      }

      // no creds in URL
      if (u.username || u.password) return helpers.error('any.invalid');

      // optionally restrict ports (helps SSRF)
      if (u.port && !['80', '443'].includes(u.port))
        return helpers.error('any.invalid');

      const host = u.hostname.toLowerCase();

      // block obvious local hosts
      if (
        host === 'localhost' ||
        host.endsWith('.localhost') ||
        host.endsWith('.local')
      ) {
        return helpers.error('any.invalid');
      }

      // if hostname is an IP, block private ranges
      const ipVersion = net.isIP(host);
      if (ipVersion === 4 && isPrivateIPv4(host))
        return helpers.error('any.invalid');
      if (ipVersion === 6 && isPrivateIPv6(host))
        return helpers.error('any.invalid');

      // optional extension check (nice-to-have, not a security guarantee)
      if (allowedExts) {
        const ext = path.extname(u.pathname).toLowerCase();
        if (!ext || !allowedExts.includes(ext)) {
          return helpers.error('any.invalid');
        }
      }

      return value;
    }, 'Safe remote src URL');
}

const remoteSrc = makeRemoteSrcSchema({
  // If you have sources without file extensions, set allowedExts: null and enforce by MIME sniffing after download
  allowedExts: null,
});

// Allow only internal references for url(...): url(#id)
// Everything else in url() is rejected.
function hasUnsafeUrlFunc(input) {
  const s = String(input || '');
  // Find url(...) occurrences (rough but effective)
  const re = /\burl\s*\(\s*([^)]+)\s*\)/gi;
  let m;
  while ((m = re.exec(s))) {
    let inside = m[1].trim();

    // strip quotes
    if (
      (inside.startsWith("'") && inside.endsWith("'")) ||
      (inside.startsWith('"') && inside.endsWith('"'))
    ) {
      inside = inside.slice(1, -1).trim();
    }

    // allow only fragment refs: #id
    if (inside.startsWith('#')) continue;

    // anything else is unsafe (http/https/data/file/javascript/etc)
    return true;
  }
  return false;
}

function isUnsafeUriValue(v) {
  const s = String(v || '').trim();

  // Allow internal fragment refs only
  if (s.startsWith('#')) return false;

  // Empty is OK (some SVGs omit it)
  if (!s) return false;

  // Disallow any scheme-like value or protocol-relative
  // Examples: http:, https:, data:, file:, javascript:, //example.com
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(s)) return true;
  if (s.startsWith('//')) return true;

  // Also block embedded <svg> via data URIs etc
  return true;
}

// ---- dimension helpers (yours, unchanged) ----
function parseSvgDimValue(v) {
  const m = String(v)
    .trim()
    .match(/^(-?\d+(\.\d+)?)(px)?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return n;
}

function extractSvgDims(svg) {
  // support both ' and " quotes
  const widthMatch = svg.match(/\bwidth\s*=\s*['"]([^'"]+)['"]/i);
  const heightMatch = svg.match(/\bheight\s*=\s*['"]([^'"]+)['"]/i);
  const viewBoxMatch = svg.match(/\bviewBox\s*=\s*['"]([^'"]+)['"]/i);

  const width = widthMatch ? parseSvgDimValue(widthMatch[1]) : null;
  const height = heightMatch ? parseSvgDimValue(heightMatch[1]) : null;

  let vbW = null,
    vbH = null;
  if (viewBoxMatch?.[1]) {
    const parts = viewBoxMatch[1].trim().split(/\s+/);
    if (parts.length === 4) {
      vbW = Number(parts[2]);
      vbH = Number(parts[3]);
      if (!Number.isFinite(vbW)) vbW = null;
      if (!Number.isFinite(vbH)) vbH = null;
    }
  }

  return { width, height, viewBoxWidth: vbW, viewBoxHeight: vbH };
}
/**
 * Create a dynamic project schema based on user's plan limits
 * @param {Object} limits - Plan limits object
 * @returns {Joi.ObjectSchema} Dynamic project schema
 */
function createProjectSchema(limits) {
  /** common sub-schemas */
  const cropParams = Joi.object({
    x: Joi.number().min(0).max(limits.maxInputResolution).required(),
    y: Joi.number().min(0).max(limits.maxInputResolution).required(),
    width: Joi.number().min(1).max(limits.maxInputResolution).required(),
    height: Joi.number().min(1).max(limits.maxInputResolution).required(),
  });

  const radiusSchema = Joi.object({
    br: Joi.number().min(0).max(limits.maxInputResolution),
    tl: Joi.number().min(0).max(limits.maxInputResolution),
    bl: Joi.number().min(0).max(limits.maxInputResolution),
    tr: Joi.number().min(0).max(limits.maxInputResolution),
  });

  // ---- main schema ----
  const safeSvgSchema = Joi.string()
    .trim()
    .min(1)
    .max(MAX_SVG_CHARS)
    .custom((svg, helpers) => {
      if (CONTROL_CHARS.test(svg)) {
        return helpers.error('any.invalid', {
          reason: 'Control characters not allowed',
        });
      }

      // Must look like SVG root
      if (!/^\s*<svg\b/i.test(svg)) {
        return helpers.error('any.invalid', {
          reason: 'Must start with <svg>',
        });
      }

      // Forbid dangerous tags (basic scan)
      for (const t of SVG_FORBIDDEN_TAGS) {
        const rx = new RegExp(`<\\s*${t}\\b`, 'i');
        if (rx.test(svg)) {
          return helpers.error('any.invalid', {
            reason: `Forbidden SVG element: <${t}>`,
          });
        }
      }

      // Forbid event handlers anywhere: onload=, onclick= ...
      if (/\son[a-z]+\s*=/i.test(svg)) {
        return helpers.error('any.invalid', {
          reason: 'Event handler attributes are not allowed',
        });
      }

      // Allow xmlns http://www.w3.org/... (do NOT ban 'http' globally)
      // But still block external url() usage:
      if (hasUnsafeUrlFunc(svg)) {
        return helpers.error('any.invalid', {
          reason: 'External url() references are not allowed (only url(#id))',
        });
      }

      // Block external href/xlink:href/src values (allow only #id or empty)
      // We scan for these attrs with either quote style.
      const uriAttrRe = /\b(href|xlink:href|src)\s*=\s*(['"])(.*?)\2/gi;
      let m;
      while ((m = uriAttrRe.exec(svg))) {
        const attr = m[1].toLowerCase();
        const value = m[3];

        if (SVG_URI_ATTRS.includes(attr) && isUnsafeUriValue(value)) {
          return helpers.error('any.invalid', {
            reason: `External ${attr} is not allowed (only "#...")`,
          });
        }
      }

      // Basic DoS guard: block insane integers (keep yours)
      if (/\b\d{8,}\b/.test(svg)) {
        return helpers.error('any.invalid', {
          reason: 'Excessive numeric values',
        });
      }

      // Dimension bounds
      const { width, height, viewBoxWidth, viewBoxHeight } =
        extractSvgDims(svg);
      const dims = [width, height, viewBoxWidth, viewBoxHeight].filter(
        (n) => n != null
      );

      for (const n of dims) {
        if (n < 0)
          return helpers.error('any.invalid', {
            reason: 'Negative dimensions not allowed',
          });
        if (n > MAX_SVG_DIMENSION)
          return helpers.error('any.invalid', {
            reason: 'SVG dimensions too large',
          });
      }

      return svg; // accept original (no sanitizing)
    }, 'Safe SVG (denylist)')
    .messages({ 'any.invalid': '{{#reason}}' });

  const baseVisual = Joi.object({
    type: Joi.string()
      .pattern(/^(image|video|text|svg|gif)$/i)
      .required(),
    x: Joi.number().max(limits.maxInputResolution),
    y: Joi.number().max(limits.maxInputResolution),
    width: Joi.number().min(1).max(limits.maxInputResolution),
    height: Joi.number().min(1).max(limits.maxInputResolution),
    position: positionPreset,
    anchor: anchor,
    resize: resizeMode.optional(),
    enterBegin: Joi.number().min(0).max(limits.maxOutputResolution),
    enterEnd: Joi.number().min(0).max(limits.maxOutputResolution),
    exitBegin: Joi.number().max(limits.maxOutputResolution).min(0),
    exitEnd: Joi.number().max(limits.maxOutputResolution).min(0),
    opacity: Joi.number().min(0).max(1),
    angle: Joi.number().min(-360).max(360),
    flipV: Joi.boolean(),
    flipH: Joi.boolean(),
    track: Joi.number().integer().min(0).max(1000000),
    enterAnimation: xfadeEffect.allow(null),
    exitAnimation: xfadeEffect.allow(null),
  }).unknown(false);

  /** per-type visuals */
  const imageLikeCommon = baseVisual.keys({
    src: remoteSrc.required(),
    cropParams: cropParams.optional(),
    filter: filterSchema.optional(),
    chromaKey: chromaKeySchema.optional(),
    zoom: Joi.boolean().optional(),
  });

  const IMAGE = imageLikeCommon.keys({
    type: Joi.string()
      .pattern(/^image$/i)
      .required(),
    radius: radiusSchema.optional(),
  });

  const GIF = imageLikeCommon.keys({
    type: Joi.string().pattern(/^gif$/i).required(),
  });

  const SVG = baseVisual.keys({
    type: Joi.string().pattern(/^svg$/i).required(),
    svg: safeSvgSchema.required(),
    filter: filterSchema.optional(),
    chromaKey: chromaKeySchema.optional(),
  });

  const VIDEO = imageLikeCommon.keys({
    type: Joi.string()
      .pattern(/^video$/i)
      .required(),
    videoBegin: Joi.number().min(0).max(limits.maxDuration),
    videoEnd: Joi.number().min(0).max(limits.maxDuration),
    videoDuration: Joi.number().min(0.1).max(limits.maxDuration),
    volume: Joi.number().min(0).max(1),
    speed: Joi.number().min(0.1).max(10),
    transition: xfadeEffect.allow(null),
    transitionDuration: Joi.number().min(0).max(limits.maxOutputResolution),
    transitionId: Joi.string().pattern(ID_REGEX).max(MAX_ID_LEN).optional(),
    frameRate: Joi.number().integer().min(1).max(MAX_ID_LEN).max(60),
    id: Joi.string().pattern(ID_REGEX).optional(),
    hasAudio: Joi.boolean().optional(),
    zoom: Joi.boolean().optional(),
  });

  const TEXT = baseVisual
    .keys({
      type: Joi.string()
        .pattern(/^text$/i)
        .required(),
      // safe plain text (no < > because you inject it directly)
      text: safeTextSchema,
      // sanitized html (or rejected if sanitizer not installed)
      html: safeHtmlSchema,
      // style object: any keys allowed, values validated for breakouts/resource loads
      style: safeStyleSchema,
    })
    .custom((value, helpers) => {
      // Require at least one of text/html to contain content
      const hasText =
        typeof value.text === 'string' && value.text.trim().length > 0;
      const hasHtml =
        typeof value.html === 'string' && value.html.trim().length > 0;

      if (!hasText && !hasHtml) {
        return helpers.error('any.invalid');
      }

      return value;
    }, 'TEXT must have content');

  /** audios */
  const audioItem = Joi.object({
    src: remoteSrc,
    enter: Joi.number().min(0).max(limits.maxOutputResolution),
    exit: Joi.number().min(0).max(limits.maxOutputResolution),
    volume: Joi.number().min(0).max(1),
    speed: Joi.number().min(0.1).max(10),
    audioBegin: Joi.number().min(0).max(limits.maxDuration),
    audioEnd: Joi.number().min(0).max(limits.maxDuration),
    audioDuration: Joi.number().min(0.1).max(limits.maxDuration).min(0),
  }).unknown(false);

  // Custom validation function for visuals that provides detailed errors
  const validateVisual = (visual, index) => {
    if (!visual || typeof visual !== 'object') {
      return { error: `Visual at index ${index} must be an object` };
    }

    const type = visual.type;
    if (!type) {
      return {
        error: `Visual at index ${index} is missing required field "type"`,
      };
    }

    let schema;
    switch (type.toUpperCase()) {
      case 'IMAGE':
        schema = IMAGE;
        break;
      case 'VIDEO':
        schema = VIDEO;
        break;
      case 'GIF':
        schema = GIF;
        break;
      case 'SVG':
        schema = SVG;
        break;
      case 'TEXT':
        schema = TEXT;
        break;
      default:
        return {
          error: `Visual at index ${index} has invalid type "${type}". Must be one of: IMAGE, VIDEO, GIF, SVG, TEXT`,
        };
    }

    const { error, value } = schema.validate(visual, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: `visuals[${index}].${detail.path.join('.')}`,
        message: detail.message,
      }));
      return { error: details };
    }

    return { value };
  };

  /** subtitle sub-schemas */
  const subtitleWordSchema = Joi.object({
    start: Joi.number().min(0).max(limits.maxInputResolution).required(),
    end: Joi.number().min(0).max(limits.maxInputResolution).required(),
    text: Joi.string().min(1).max(MAX_SUBTITLE_WORD_LEN).required(),
  }).unknown(false);

  const subtitleCaptionSchema = Joi.object({
    start: Joi.number().min(0).max(limits.maxInputResolution).required(),
    end: Joi.number().min(0).max(limits.maxInputResolution).required(),
    text: Joi.string().min(1).max(MAX_SUBTITLE_TEXT_LEN).required(),
    words: Joi.array().items(subtitleWordSchema).min(1).required(),
  }).unknown(false);

  const subtitleStylesSchema = Joi.object({
    color: Joi.string().pattern(hexColorWithAlpha).optional(),
    background: Joi.string().pattern(hexColorWithAlpha).optional(),
    isBold: Joi.boolean().optional(),
    isItalic: Joi.boolean().optional(),
    fontSize: Joi.number().min(1).max(MAX_FONT_SIZE).optional(),
    fontFamily: Joi.string().pattern(NAME_REGEX).max(MAX_NAME_LEN),
    textTransform: Joi.string()
      .valid('uppercase', 'lowercase', 'capitalize')
      .optional(),
    outline: Joi.object({
      width: Joi.number().min(0).max(MAX_OUTLINE_WIDTH).required(),
      color: Joi.string().pattern(hexColorWithAlpha).required(),
    }).optional(),
    position: Joi.string()
      .valid(
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'center-center',
        'center-left',
        'center-right'
      )
      .optional(),
    marginV: Joi.number()
      .integer()
      .min(0)
      .max(limits.maxOutputResolution)
      .optional(),
    marginH: Joi.number()
      .integer()
      .min(0)
      .max(limits.maxOutputResolution)
      .optional(),
    mode: Joi.string()
      .valid('normal', 'one-word', 'karaoke', 'progressive')
      .optional(),
    activeWord: Joi.object({
      color: Joi.string().pattern(hexColorWithAlpha).required(),
    }).optional(),
  }).unknown(false);

  const subtitleSchema = Joi.object({
    captions: Joi.array().items(subtitleCaptionSchema).min(1).required(),
    styles: subtitleStylesSchema.optional(),
  }).unknown(false);
  return Joi.object({
    name: Joi.string()
      .pattern(NAME_REGEX)
      .max(MAX_NAME_LEN)
      .optional()
      .default('unnamed'),
    resolution: resolutionPreset,
    width: Joi.number()
      .integer()
      .min(1)
      .max(limits.maxOutputResolution)
      .default(1280)
      .messages({
        'number.base': 'Width must be a number',
        'number.min': 'Width must be at least 1 pixel',
        'number.max': `Width cannot exceed ${limits.maxOutputResolution} pixels (based on your ${limits.planName} plan)`,
      }),
    height: Joi.number()
      .integer()
      .min(1)
      .max(limits.maxOutputResolution)
      .default(720)
      .messages({
        'number.base': 'Height must be a number',
        'number.min': 'Height must be at least 1 pixel',
        'number.max': `Height cannot exceed ${limits.maxOutputResolution} pixels (based on your ${limits.planName} plan)`,
      }),

    duration: Joi.number()
      .min(0.1)
      .max(limits.maxDuration)
      .default(10)
      .messages({
        'number.base': 'Duration must be a number',
        'number.min': 'Duration must be at least 0.1 seconds',
        'number.max': `Duration cannot exceed ${limits.maxDuration} seconds (${Math.floor(limits.maxDuration / 60)} minutes) based on your ${limits.planName} plan`,
      }),

    frameRate: Joi.number().integer().min(1).max(60).default(30).messages({
      'number.base': 'Frame rate must be a number',
      'number.integer': 'Frame rate must be an integer',
      'number.min': 'Frame rate must be at least 1 fps',
      'number.max': 'Frame rate cannot exceed 60 fps',
    }),

    outputFormat: Joi.string()
      .valid('mp4', 'mov', 'avi', 'webm')
      .default('mp4')
      .messages({
        'any.only':
          'All FFMPEG output formats are supported, but currently we only support one of: mp4, mov, avi, webm, if you need more, please contact us, or open an issue.',
      }),

    backgroundColor: Joi.string()
      .pattern(hexColor)
      .default('#ffffff')
      .messages({
        'string.pattern.base':
          'Background color must be a valid hex color (e.g., #ffffff)',
      }),

    visuals: Joi.array().items(Joi.any()),
    audios: Joi.array().items(audioItem),
    thumbnail: remoteSrc,
    subtitle: Joi.any().optional(),
  }).custom((value, helpers) => {
    /** Collect ALL structured errors here */
    const errors = [];

    // ---- Validate visuals manually for better error messages ----
    if (value.visuals && Array.isArray(value.visuals)) {
      const validatedVisuals = [];

      // Check total visuals limit
      // if (value.visuals.length > limits.maxVisualElements) {
      //   errors.push({
      //     field: `visuals`,
      //     message: `Max visuals allowed is ${limits.maxVisualElements} (based on your ${limits.planName} plan)`,
      //   });
      // }

      // Count different types
      const images = value.visuals.filter(
        (visual) => visual.type.toLowerCase() === 'image'
      );
      const videos = value.visuals.filter(
        (visual) => visual.type.toLowerCase() === 'video'
      );
      const gifs = value.visuals.filter(
        (visual) => visual.type.toLowerCase() === 'gif'
      );

      // Check images limit
      if (images.length > limits.maxImagesCount) {
        errors.push({
          field: `visuals`,
          message: `Max images allowed is ${limits.maxImagesCount} (based on your ${limits.planName} plan)`,
        });
      }

      // Check videos limit
      if (videos.length > limits.maxVideosCount) {
        errors.push({
          field: `visuals`,
          message: `Max videos allowed is ${limits.maxVideosCount} (based on your ${limits.planName} plan)`,
        });
      }

      // Check gifs limit
      if (gifs.length > limits.maxGifsCount) {
        errors.push({
          field: `visuals`,
          message: `Max gifs allowed is ${limits.maxGifsCount} (based on your ${limits.planName} plan)`,
        });
      }

      // Validate each visual and check dimensions
      for (let i = 0; i < value.visuals.length; i++) {
        const result = validateVisual(value.visuals[i], i);

        if (result.error) {
          if (Array.isArray(result.error)) {
            errors.push(...result.error);
          } else {
            errors.push({
              field: `visuals[${i}]`,
              message: result.error,
            });
          }
        } else if (result.value) {
          // Check input dimensions
          const visual = result.value;
          if (visual.width && visual.width > limits.maxInputResolution) {
            errors.push({
              field: `visuals[${i}].width`,
              message: `Visual width cannot exceed ${limits.maxInputResolution}px (based on your ${limits.planName} plan)`,
            });
          }
          if (visual.height && visual.height > limits.maxInputResolution) {
            errors.push({
              field: `visuals[${i}].height`,
              message: `Visual height cannot exceed ${limits.maxInputResolution}px (based on your ${limits.planName} plan)`,
            });
          }
          validatedVisuals.push(result.value);
        }
      }

      if (!errors.length) {
        value.visuals = validatedVisuals;
      }
    }

    // ---- Validate audios ----
    if (value.audios && Array.isArray(value.audios)) {
      if (value.audios.length > limits.maxAudioElements) {
        errors.push({
          field: `audios`,
          message: `Max audios allowed is ${limits.maxAudioElements} (based on your ${limits.planName} plan)`,
        });
      }
    }

    // ---- Validate subtitle with full nested errors ----
    if (value.subtitle != null) {
      if (
        value.subtitle.captions &&
        value.subtitle.captions.length > limits.maxCaptionElements
      ) {
        errors.push({
          field: `subtitle.captions`,
          message: `Max captions allowed is ${limits.maxCaptionElements} (based on your ${limits.planName} plan)`,
        });
      }
      const { error, value: validatedSubtitle } = subtitleSchema.validate(
        value.subtitle,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

      if (error) {
        const details = error.details.map((detail) => {
          const path = detail.path.join('.');
          return {
            field: `subtitle.${path}`,
            message: detail.message,
          };
        });

        errors.push(...details);
      } else {
        value.subtitle = validatedSubtitle;
      }
    }

    // ---- Handle resolution overrides ----
    if (value.resolution && value.resolution !== 'custom') {
      value = { ...value };
      delete value.width;
      delete value.height;
    }

    // ---- Temporal sanity checks for visuals ----
    for (let i = 0; i < (value.visuals || []).length; i++) {
      const item = value.visuals[i];

      if (
        typeof item.enterBegin === 'number' &&
        typeof item.enterEnd === 'number' &&
        item.enterEnd < item.enterBegin
      ) {
        errors.push({
          field: `visuals[${i}].enterEnd`,
          message: 'enterEnd cannot be before enterBegin',
        });
      }

      if (
        typeof item.exitBegin === 'number' &&
        typeof item.exitEnd === 'number' &&
        item.exitEnd < item.exitBegin
      ) {
        errors.push({
          field: `visuals[${i}].exitEnd`,
          message: 'exitEnd cannot be before exitBegin',
        });
      }
    }

    // ---- Temporal sanity checks for audios ----
    for (let i = 0; i < (value.audios || []).length; i++) {
      const a = value.audios[i];

      if (
        typeof a.enter === 'number' &&
        typeof a.exit === 'number' &&
        a.exit < a.enter
      ) {
        errors.push({
          field: `audios[${i}].exit`,
          message: 'audio.exit cannot be before audio.enter',
        });
      }

      if (
        typeof a.audioBegin === 'number' &&
        typeof a.audioEnd === 'number' &&
        a.audioEnd < a.audioBegin
      ) {
        errors.push({
          field: `audios[${i}].audioEnd`,
          message: 'audioEnd cannot be before audioBegin',
        });
      }
    }

    // ---- If we collected any errors, surface them ----
    if (errors.length > 0) {
      return helpers.error('any.custom', {
        errors,
      });
    }

    return value;
  }, 'Project cross-field checks');
}

/** Legacy static project schema (kept for backward compatibility with existing code) */
const projectSchema = createProjectSchema({
  maxImagesCount: 30,
  maxVideosCount: 15,
  maxGifsCount: 10,
  maxVisualElements: 200,
  maxAudioElements: 100,
  maxCaptionElements: 1000,
  maxDuration: 600,
  maxInputResolution: 3840,
  maxOutputResolution: 1920,
  planName: 'Default',
});

/** outer schema */
const renderJobSchema = Joi.object({
  payload: projectSchema.required(),
  jobId: Joi.string().uuid().optional(),
  clientKey: Joi.string().optional(),
});

// Credit addition validation (admin)
const addCreditsSchema = Joi.object({
  userId: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required',
  }),
  amount: Joi.number().integer().positive().max(100000).required().messages({
    'number.base': 'Amount must be a number',
    'number.integer': 'Amount must be an integer',
    'number.positive': 'Amount must be positive',
    'number.max': 'Amount cannot exceed 100,000 credits',
    'any.required': 'Amount is required',
  }),
  reason: Joi.string().min(1).max(255).required().messages({
    'string.min': 'Reason is required',
    'string.max': 'Reason cannot exceed 255 characters',
    'any.required': 'Reason is required',
  }),
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  sortBy: Joi.string().valid(
    'created_at',
    'updated_at',
    'createdAt',
    'updatedAt',
    'name',
    'email'
  ),
  sortOrder: Joi.string().valid('ASC', 'DESC'),
});

// Audit log filters validation
const auditFiltersSchema = Joi.object({
  userId: Joi.number().integer().positive().optional(),
  apiKeyId: Joi.number().integer().positive().optional(),
  action: Joi.string().optional(),
  resourceType: Joi.string().optional(),
  ipAddress: Joi.string().ip().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'End date must be after start date',
  }),
});

// Enhanced validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details
        .map((detail) => {
          // Check if this is a custom error with nested validation errors
          if (detail.type === 'any.custom' && detail.context?.errors) {
            return detail.context.errors;
          }

          return {
            field: detail.path.join('.'),
            message: detail.message,
          };
        })
        .flat(); // Flatten in case of nested error arrays

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: errors,
      });
    }

    req[property] = value;
    next();
  };
};

const contactSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
  message: Joi.string().required().messages({
    'any.required': 'Message is required.',
  }),
  reason: Joi.string()
    .valid('affiliate', 'partner', 'general', 'Affiliate', 'Partner', 'General')
    .default('general')
    .messages({
      'any.only': 'Reason must be one of: affiliate, partner, general.',
    }),
}).unknown(true);

const optionalUrlSchema = Joi.string()
  .trim()
  .allow('')
  .max(2048)
  .custom((value, helpers) => {
    if (!value) {
      return value;
    }

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return helpers.error('string.uriCustom');
      }
      return value;
    } catch (_error) {
      return helpers.error('string.uriCustom');
    }
  })
  .messages({
    'string.uriCustom': 'Cover image URL must be a valid http or https URL',
  });

const blogPayloadSchema = Joi.object({
  title: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Title is required',
    'any.required': 'Title is required',
  }),
  slug: Joi.string().trim().allow('').max(255).optional(),
  excerpt: Joi.string().allow('').max(5000).default(''),
  content: Joi.string().allow('').max(200000).default(''),
  coverImageUrl: optionalUrlSchema.default(''),
  seoTitle: Joi.string().trim().allow('').max(255).default(''),
  seoDescription: Joi.string().trim().allow('').max(320).default(''),
});

const publishedBlogListSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(20).optional(),
});

// Specific validation middlewares
const validateRegistration = validate(registerSchema);
const validateLogin = validate(loginSchema);
const validatePasswordChange = validate(changePasswordSchema);
const validateForgotPassword = validate(forgotPasswordSchema);
const validateResetPassword = validate(resetPasswordSchema);
const validateApiKeyCreation = validate(createApiKeySchema);
const validateApiKeyUpdate = validate(updateApiKeySchema);
const validateAddCredits = validate(addCreditsSchema);
const validatePagination = validate(paginationSchema, 'query');
const validateAuditFilters = validate(auditFiltersSchema, 'query');
const validateContact = validate(contactSchema);
const validateBlogPayload = validate(blogPayloadSchema);
const validatePublishedBlogList = validate(publishedBlogListSchema, 'query');

// Dynamic validation for render jobs based on user's plan limits
const validateRenderJob = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found in request',
      });
    }

    // Fetch user's plan limits
    const limits = await planLimitsService.getUserPlanLimits(userId);

    // Create dynamic project schema with user's plan limits
    const dynamicProjectSchema = createProjectSchema(limits);

    // Create dynamic render job schema
    const dynamicRenderJobSchema = Joi.object({
      payload: dynamicProjectSchema.required(),
      jobId: Joi.string().uuid().optional(),
      clientKey: Joi.string().optional(),
    });

    // Validate the request body
    const { error, value } = dynamicRenderJobSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details
        .map((detail) => {
          // Check if this is a custom error with nested validation errors
          if (detail.type === 'any.custom' && detail.context?.errors) {
            return detail.context.errors;
          }

          return {
            field: detail.path.join('.'),
            message: detail.message,
          };
        })
        .flat(); // Flatten in case of nested error arrays

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: errors,
        planLimits: {
          planName: limits.planName,
          maxDuration: limits.maxDuration,
          maxOutputResolution: limits.maxOutputResolution,
          maxVisualElements: limits.maxVisualElements,
          maxImagesCount: limits.maxImagesCount,
          maxVideosCount: limits.maxVideosCount,
          maxGifsCount: limits.maxGifsCount,
          maxAudioElements: limits.maxAudioElements,
          maxCaptionElements: limits.maxCaptionElements,
        },
      });
    }

    req.body = value;
    next();
  } catch (error) {
    console.error('Error in validateRenderJob:', error);
    return res.status(500).json({
      error: 'Validation error',
      message: 'An error occurred while validating your request',
    });
  }
};

const preCheckoutSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

const preCheckout = validate(preCheckoutSchema);

// Email validation
const validateEmail = (req, res, next) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string' || token.length < 10) {
    return res.status(400).json({
      error: 'Invalid verification token',
      message: 'Please provide a valid verification token',
    });
  }

  next();
};

// ID parameter validation
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName]);

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: `${paramName} must be a positive integer`,
      });
    }

    req.params[paramName] = id;
    next();
  };
};

// UUID validation for job IDs
const validateJobId = (req, res, next) => {
  const { id } = req.params;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      error: 'Invalid job ID',
      message: 'Job ID must be a valid UUID',
    });
  }

  next();
};

module.exports = {
  validate,
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateForgotPassword,
  validateResetPassword,
  validateApiKeyCreation,
  validateApiKeyUpdate,
  validateRenderJob,
  validateAddCredits,
  validatePagination,
  validateAuditFilters,
  validateEmail,
  validateId,
  validateJobId,
  preCheckout,
  validateContact,
  validateBlogPayload,
  validatePublishedBlogList,

  // Export schemas for direct use
  schemas: {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    createApiKeySchema,
    updateApiKeySchema,
    renderJobSchema,
    addCreditsSchema,
    paginationSchema,
    auditFiltersSchema,
    preCheckoutSchema,
    contactSchema,
    blogPayloadSchema,
    publishedBlogListSchema,
  },
};
