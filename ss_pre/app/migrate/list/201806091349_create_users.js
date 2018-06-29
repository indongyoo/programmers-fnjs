module.exports = function(QUERY_T) {
  return QUERY_T(`
    CREATE TABLE users (
      id          serial PRIMARY KEY,
      name        varchar(255) NOT NULL,
      created_at  timestamptz,
      updated_at  timestamptz
    );
  `);
};