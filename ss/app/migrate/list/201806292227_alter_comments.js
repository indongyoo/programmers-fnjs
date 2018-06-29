module.exports = function(QUERY_T) {
  return QUERY_T(`
    ALTER TABLE comments 
      ADD COLUMN tags jsonb;
  `);
};