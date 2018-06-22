!function () {
  const { html } = Ttl;

  Tmpl.layout = ({ body, klass, scripts}) => html`
    <!DOCTYPE html>
    <html class="${klass}">
    <head>
      <meta charset="utf-8">
      <title>SC</title>
      <link rel="stylesheet" href="/front/css/style.css">
    </head>
    <body class="${klass}">
      ${body}
      
      <script src="/share/base/global.js"></script>
      <script src="/share/base/Functional.js"></script>
      <script>Object.assign(window, Functional);</script>
      <script src="/share/base/date-fns.js"></script>
      <script src="/share/base/DateFns.js"></script>
      <script src="/share/base/Ttl.js"></script>
      <script src="/share/base/$.js"></script>
      <script src="/share/template/Tmpl.js"></script>
      
      <script src="/share/template/Tmpl.post.js"></script>
      <script src="/front/accounts/Accounts.js"></script>
      <script src="/front/post/Post.js"></script>
      <script src="/front/post/Post.list.js"></script>
      <script src="/front/post/Post.editor.js"></script>
      
      ${scripts}
    </body>
    </html>
  `;

  Tmpl.layout.bf = ({ body, klass, scripts}) => Tmpl.layout({
    body: `
      <div id="body">${body}</div>
      <div id="footer">© 2018 SHOPSTAGRAM</div>
    `,
    klass,
    scripts
  });

  Tmpl.layout.hbf = ({ user, body, klass, scripts = []}) => Tmpl.layout({
    body: `
      <div id="header">
        <h1>SHOPSTAGRAM</h1>
        <ul>
          <li><button type="button" class="open_editor">새글작성</button></li>
          <li><a href="/@/${user.id}">${user.name}님 프로필</a></li>
          <li><a href="/logout">로그아웃</a></li>
        </ul>
      </div>
      <div id="body">${body}</div>
      <div id="footer">© 2018 SHOPSTAGRAM</div>
    `,
    klass,
    scripts: [
     `<script type="module">
        Post.editor.init();
      </script>`,
      ...scripts]
  });
} ();