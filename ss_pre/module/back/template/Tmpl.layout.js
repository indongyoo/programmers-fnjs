!function () {
  Tmpl.layout = ({ body, scripts }) => html`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>SC</title>
        <link rel="stylesheet" href="/style/style.css">
        <link rel="stylesheet" href="/front/css/style.css">
      </head>
      <body>
        ${body}
        
        <script src="/share/base/global.js"></script>
        <script src="/share/base/Functional.js"></script>
        <script>Object.assign(window, Functional);</script>
        <script src="/share/base/Dates.js"></script>
        <script src="/front/base/$.js"></script>
        <script src="/share/base/Ttl.js"></script>
        <script>global.html = Ttl.html;</script>
        <script src="/share/template/Tmpl.js"></script>
        <script src="/share/template/Tmpl.post.js"></script>
        
        <script src="/front/account/Account.js"></script>
        <script src="/front/post/Post.js"></script>
        
         
        ${scripts}
      </body>
    </html>
  `;

  Tmpl.layout.hbf = ({ body, scripts }) =>
    Tmpl.layout({
      body: html`
        <div class="header">
          <a href="/logout">로그아웃</a>
        </div>
        <div class="options">
          <button type="button" class="create_post">글 작성</button>
        </div>
        <div class="body">${body}</div>
        <div class="footer"></div>
      `,
      scripts
    });
} ();