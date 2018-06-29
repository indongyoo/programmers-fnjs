App.get('/signup', function(req, res) {
  res.send(Tmpl.layout({
    body: `
      <div class="account">
        <div class="signup">
          <input type="email" placeholder="이메일을 입력해주세요." name="email">
          <input type="text" placeholder="이름을 입력해주세요." name="name">
          <button type="button">가입하기...</button>
        </div>
        <a href="/login">로그인</a>  
      </div>
    `,
    scripts: `
      <script>go('.account', $, Account.signup.init)</script>
    `
  }));
});

App.get('/login', function(req, res) {
  res.send(Tmpl.layout({
    body: `
      <div class="account">
        <div class="login">
          <input type="text" placeholder="이름을 입력해주세요." name="name">
          <button type="button">로그인</button>
        </div>
        <a href="/signup">가입</a>  
      </div>
    `,
    scripts: `
      <script>go('.account', $, Account.login.init)</script>
    `
  }));
});

App.get('/logout', (req, res) => go(
  req.session.user = null,
  _ => res.redirect('/login')
));

App.post('/api/users', function(req, res, next) {
  go(
    req.body,
    pick(['name', 'email']),
    pipeT(
      attrs => QUERY(INSERT `users` (attrs)),
      user => req.session.user = user,
      res.json
    ).catch(
      match
        .case({constraint: 'users_name_key'}) (
          _ => 'DUPLICATE_NAME'
        )
        .case({constraint: 'users_email_key'}) (
          _ => 'DUPLICATE_EMAIL'
        )
        .else (_ => ''),
      tap(log),
      m => new Error(m),
      next
    )
  )
});

App.post('/api/login', (req, res) => go(
  QUERY1(SELECT `*`, FROM `users`, WHERE `${req.body}`),
  user => req.session.user = user,
  Boolean,
  res.json
));

