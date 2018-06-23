module.exports = function(QUERY_T) {
  return QUERY_T(`
    CREATE TABLE posts (
      id          serial PRIMARY KEY,
      body        text,
      user_id     integer REFERENCES users,
      tags        jsonb,
      created_at  timestamptz,
      updated_at  timestamptz
    );
  `);
};