!function() {
  const az = n => n < 10 ? `0${n}` : n;

  const baseWord = date => {
    const y = date.getFullYear();
    const M = az(date.getMonth() + 1);
    const d = az(date.getDate());
    var h = date.getHours();
    const ampm = h < 12 ? '오전' : '오후';
    h = az(h < 13 ? h : h - 12);
    const m = az(date.getMinutes());
    const s = az(date.getSeconds());
    return `${y}.${M}.${d} ${ampm} ${h}:${m}:${s}`;
  };

  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  const baseDiff = time => curry((a, b) =>
    parseInt(Math.abs(a - b) / time));

  const diffSecond = baseDiff(SECOND);

  const diffMinute = baseDiff(MINUTE);

  const diffHour = baseDiff(HOUR);

  const diffDay = baseDiff(DAY);

  const word = date => {
    date = new Date(date);
    const now = new Date;
    return (
      diffMinute(now, date) == 0 ?
        '방금' :
      diffHour(now, date) == 0 ?
        diffMinute(now, date) + '분 전' :
      diffDay(now, date) == 0 ?
        diffHour(now, date) + '시간 전' :
      baseWord(date)
    );
  };

  global.Dates = {
    word,
    diffDay,
    diffHour,
    diffMinute,
    diffSecond
  };
} ();