module.exports = function(QUERY_T) {
  return QUERY_T(`
    ALTER TABLE posts RENAME TO users;
  `);
};