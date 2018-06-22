module.exports = function(QUERY_T) {
  return QUERY_T(`
    ALTER TABLE users 
      ADD CONSTRAINT users_name_key UNIQUE (name);
  `);
};