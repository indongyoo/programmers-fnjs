!function() {
  const signup = {
    init: $.on('click', 'button', ({delegateTarget: dt}) => go(
      {
        email: go(dt, $.find('[name="email"]'), $.val),
        name: go(dt, $.find('[name="name"]'), $.val),
      },
      pipeT(
        $.post('/api/users'),
        _ => location.href = '/'
      ).catch(
        res => res.text(),
        match
          .case('DUPLICATE_EMAIL')
            (_ => alert('이메일이 중복되었습니다.'))
          .else
            (_ => alert('이름이 중복되었습니다.')))
    ))
  };

  const login = {
    init: el => go(
      el,
      $.on('click', 'button', ({delegateTarget: dt}) => go(
        { name: go(dt, $.find('[name="name"]'), $.val) },
        $.post('/api/login'),
        match
          .case(a => a) (_ => location.href = '/')
          .else(_ => alert('이름이 없어요.'))
      ))
    )
  };

  global.Account = {
    signup,
    login
  };
} ();