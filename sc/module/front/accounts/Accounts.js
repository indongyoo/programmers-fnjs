!function(Root) {
  const signup = {};
  signup.init = el => go(
    el,
    $.on('click', 'button', e => go(
      el,
      pipeT(
        $.toJSON,
        $.post('/api/accounts/signup'),
          _ => location.href = '/'
      ).catch(
        res => res.text(),
        match
          .case('DUPLICATE_EMAIL')
            (_ => alert('이메일이 중복되었습니다.'))
          .else
            (_ => alert('이름이 중복되었습니다.'))
      )
    ))
  );

  const login = {};
  login.init = el => go(
    el,
    $.on('click', 'button', e => go(
      el,
      $.toJSON,
      $.post('/api/accounts/login'),
      tap(log),
      match
        .case(identity) (_ => location.href = '/')
        .else (_ => alert('다시 입력해주세요.'))
    ))
  );

  Root.Accounts = {
    signup,
    login
  };
} (window);