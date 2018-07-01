global.Post = {};

Post.SELECT = ({ limit = 5, offset = 0 }, login_user_id, tag) => go(
    ASSOCIATE `
      posts ${[
        tag ? Q`WHERE tags ? ${tag}` : '', 
        Q`ORDER BY ID DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
      ]}
        - user
        < comments ${'ORDER BY id ASC'} 
          - user`,
    login_user_id ?
      each(p => {
        p._.is_login_user = login_user_id == p.user_id;
        each(c => c._.is_login_user = login_user_id == c.user_id, p._.comments)
      }) :
      a => a);