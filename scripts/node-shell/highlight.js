#!/usr/bin/env node

const Prism = require('node-prismjs');

Prism.languages.angular = Prism.languages.extend('typescript', {});

Prism.languages.insertBefore('angular', 'string', {
  'template-string': {
    pattern: /template[\s]*:[\s]*`(?:\\[\s\S]|[^\\`])*`/,
    greedy : true,
    inside : {
      'html': {
        pattern: /`(?:\\[\s\S]|[^\\`])*`/,
        inside : Prism.languages.html
      }
    }
  },
  'styles-string'   : {
    pattern: /styles[\s]*:[\s]*\[[\s]*`(?:\\[\s\S]|[^\\`])*`[\s]*\]/,
    greedy : true,
    inside : {
      'less': {
        pattern: /`(?:\\[\s\S]|[^\\`])*`/,
        inside : Prism.languages.less
      }
    }
  }
});

exports.highlightOriginal = (code, lang) => {
  const language = Prism.languages[lang] || Prism.languages.autoit;
  return Prism.highlight(code, language)
}

exports.highlight = (code, lang) => {
  const language = Prism.languages[lang] || Prism.languages.autoit;
  const out = Prism.highlight(code, language)

  if (out == null) {
    return out
  } else if (!lang) {
    code = out;
    return '<pre><code>' + (true ? code : escape(code, true)) + '</code></pre>';
  }
  code = out;
  return (
    '<pre class="' +
    'language-' +
    escape(lang, true) +
    '">' +
    '<code>' +
    (true ? code : escape(code, true)) +
    '</code></pre>\n'
  );
}