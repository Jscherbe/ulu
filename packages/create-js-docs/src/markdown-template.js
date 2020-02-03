/**
 *   Markdown File String Template
 *   @param  {string} title
 *   @param  {string} description
 *   @param  {string} toc
 *   @param  {string} docs        The documentation (body)
 *   @return {string}             Markdown File
 */
module.exports = function templateMarkdown(title, description, toc, docs) {
  const isset = v => v ? v : "";

  return `
# ${ isset(title) }

${ isset(description) }

## Table of Contents

${ isset(toc) }

---

${ isset(docs) }`;
}