App.get('/signup', function(req, res) {
  res.send(Tmpl.layout.bf({
    body: `
      <div class="accounts">
        <div class="body">
          <input type="email" name="email" placeholder="이메일을 입력해주세요.">
          <input type="text" name="name" placeholder="닉네임을 입력해주세요. (영문)">
          <button type="submit">가입하기</button>
        </div>
        <div class="footer">
          <p>계정이 있으신가요? <a href="/login">로그인</a></p>
        </div>
      </div>
    `,
    scripts: [`
      <script type="module">
        go('.accounts', $, Accounts.signup.init);
      </script>
    `]
  }))
});

App.get('/login', function(req, res) {
  res.send(Tmpl.layout.bf({
    body: `
      <div class="accounts">
        <div class="body">
          <input type="text" name="name" placeholder="닉네임을 입력해주세요.">
          <button type="submit">로그인하기</button>
        </div>
        <div class="footer">
          <p>계정이 없으신가요? <a href="/signup">가입하기</a></p>
        </div>
      </div>
    `,
    scripts: [`
      <script>
        go('.accounts', $, Accounts.login.init);
      </script>  
    `]
  }))
});

App.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/login');
});

App.post('/api/accounts/signup', (req, res, next) => go(
  req.body,
  pick(['email', 'name']),
  pipeT(
    user => QUERY1(INSERT `users` (user), RALL),
    user => req.session.user = user,
    res.json
  ).catch(
    match
      .case({constraint: 'users_email_key'}) (_ => new Error('DUPLICATE_EMAIL'))
      .case({constraint: 'users_name_key'}) (_ => new Error('DUPLICATE_NAME'))
      .else(e => e),
    next
  ))
);

App.post('/api/accounts/login', (req, res) => go(
  req.body.name,
  name => QUERY(SELECT `*`, FROM `users`, WHERE `name = ${name}`),
  first,
  user => req.session.user = user || null,
  res.json
));