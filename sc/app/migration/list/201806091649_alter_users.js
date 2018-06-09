module.exports = function(queryT) {
  return queryT(`
    ALTER TABLE posts RENAME TO users;
  `);
};