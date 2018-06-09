module.exports = function(queryT) {
  return queryT(`
    ALTER TABLE users 
      ADD COLUMN email varchar(255) NOT NULL UNIQUE;
  `);
};