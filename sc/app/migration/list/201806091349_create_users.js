module.exports = function(queryT) {
  log('---------------??????');
  return queryT(`
    CREATE TABLE posts (
      id          serial PRIMARY KEY,
      name        varchar(255) NOT NULL,
      created_at  timestamptz,
      updated_at  timestamptz
    );
  `);
};