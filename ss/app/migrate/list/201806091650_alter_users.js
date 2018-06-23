module.exports = function(QUERY_T) {
  return QUERY_T(`
    ALTER TABLE users 
      ADD COLUMN email varchar(255) NOT NULL UNIQUE;
  `);
};