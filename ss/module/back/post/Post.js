global.Post = {};

Post.SELECT = ({limit = 5, offset = 0} = {}) =>
  ASSOCIATE `
    posts ${Q`ORDER BY id DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`}
      - user
      < comments ${'ORDER BY id ASC'}
        - user`;