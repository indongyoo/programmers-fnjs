!function() {
  const az = n => n < 10 ? `0${n}`: n;

  const baseWord = date => {
    date = new Date(date);

    const y = date.getFullYear();
    const M = az(date.getMonth() + 1);
    const d = az(date.getDate());
    var h = az(date.getHours());
    const ampm = h < 12 ? '오전' : '오후';
    h = h > 12 ? h - 12 : h;
    const m = az(date.getMinutes());
    const s = az(date.getSeconds());

    return `${y}.${M}.${d} ${ampm} ${h}:${m}:${s}`;
  };

  const ONE_SECOND = 1000;
  const ONE_MINUTE = ONE_SECOND * 60;
  const ONE_HOUR = ONE_MINUTE * 60;
  const ONE_DAY = ONE_HOUR * 24;

  const baseDiff = time => (a, b) => parseInt(Math.abs(a - b) / time);

  const diffDays = baseDiff(ONE_DAY);

  const diffHours = baseDiff(ONE_HOUR);

  const diffMinutes = baseDiff(ONE_MINUTE);

  const word = (date) => {
    date = new Date(date);
    const now = new Date();
    return (
      diffMinutes(date, now) == 0 ? '방금' :
      diffHours(date, now) == 0 ? (diffMinutes(date, now)+1) + '분 전' :
      diffDays(date, now) == 0 ? (diffHours(date, now)+1) + '시간 전' :
      baseWord(date)
    );
  };

  global.Dates = {
    word
  };
} ();