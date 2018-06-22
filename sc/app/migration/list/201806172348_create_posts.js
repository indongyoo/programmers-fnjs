module.exports = function(QUERY_T) {
  return QUERY_T(`
    CREATE TABLE comments (
      id          serial PRIMARY KEY,
      body        text,
      user_id     integer REFERENCES users,
      post_id     integer REFERENCES posts,
      created_at  timestamptz,
      updated_at  timestamptz
    );
  `);
};