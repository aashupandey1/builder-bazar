// Generates URL-safe slugs
module.exports = function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
};
