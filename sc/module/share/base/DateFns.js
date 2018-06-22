// locale ko, global.DateFns
!function() {
  global.DateFns = Object.assign({}, dateFns);

  var commonFormatterKeys = [
    'M', 'MM', 'Q', 'D', 'DD', 'DDD', 'DDDD', 'd',
    'E', 'W', 'WW', 'YY', 'YYYY', 'GG', 'GGGG',
    'H', 'HH', 'h', 'hh', 'm', 'mm',
    's', 'ss', 'S', 'SS', 'SSS',
    'Z', 'ZZ', 'X', 'x'
  ]

  function buildFormattingTokensRegExp(formatters) {
    var formatterKeys = []
    for (var key in formatters) {
      if (formatters.hasOwnProperty(key)) {
        formatterKeys.push(key)
      }
    }

    var formattingTokens = commonFormatterKeys
      .concat(formatterKeys)
      .sort()
      .reverse()
    var formattingTokensRegExp = new RegExp(
      '(\\[[^\\[]*\\])|(\\\\)?' + '(' + formattingTokens.join('|') + '|.)', 'g'
    )

    return formattingTokensRegExp
  }

  function buildDistanceInWordsLocale() {
    var distanceInWordsLocale = {
      lessThanXSeconds: {
        one: '1초',
        other: '{{count}}초'
      },

      xSeconds: {
        one: '1초',
        other: '{{count}}초'
      },

      halfAMinute: '30초',

      lessThanXMinutes: {
        one: '1분',
        other: '{{count}}분'
      },

      xMinutes: {
        one: '1분',
        other: '{{count}}분'
      },

      aboutXHours: {
        one: '약 1시간',
        other: '약 {{count}}시간'
      },

      xHours: {
        one: '1시간',
        other: '{{count}}시간'
      },

      xDays: {
        one: '1일',
        other: '{{count}}일'
      },

      aboutXMonths: {
        one: '약 1개월',
        other: '약 {{count}}개월'
      },

      xMonths: {
        one: '1개월',
        other: '{{count}}개월'
      },

      aboutXYears: {
        one: '약 1년',
        other: '약 {{count}}년'
      },

      xYears: {
        one: '1년',
        other: '{{count}}년'
      },

      overXYears: {
        one: '1년 이상',
        other: '{{count}}년 이상'
      },

      almostXYears: {
        one: '거의 1년',
        other: '거의 {{count}}년'
      }
    };

    function localize(token, count, options) {
      options = options || {}

      var result
      if (typeof distanceInWordsLocale[token] === 'string') {
        result = distanceInWordsLocale[token]
      } else if (count === 1) {
        result = distanceInWordsLocale[token].one
      } else {
        result = distanceInWordsLocale[token].other.replace('{{count}}', count)
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return result + ' 후'
        } else {
          return result + ' 전'
        }
      }

      return result
    }

    return {
      localize: localize
    }
  }

  function buildFormatLocale() {
    var months3char = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    var monthsFull = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    var weekdays2char = ['일', '월', '화', '수', '목', '금', '토']
    var weekdays3char = ['일', '월', '화', '수', '목', '금', '토']
    var weekdaysFull = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    var meridiemUppercase = ['오전', '오후']
    var meridiemLowercase = ['오전', '오후']
    var meridiemFull = ['오전', '오후']

    var formatters = {
      // Month: Jan, Feb, ..., Dec
      'MMM': function (date) {
        return months3char[date.getMonth()]
      },

      // Month: January, February, ..., December
      'MMMM': function (date) {
        return monthsFull[date.getMonth()]
      },

      // Day of week: Su, Mo, ..., Sa
      'dd': function (date) {
        return weekdays2char[date.getDay()]
      },

      // Day of week: Sun, Mon, ..., Sat
      'ddd': function (date) {
        return weekdays3char[date.getDay()]
      },

      // Day of week: Sunday, Monday, ..., Saturday
      'dddd': function (date) {
        return weekdaysFull[date.getDay()]
      },

      // AM, PM
      'A': function (date) {
        return (date.getHours() / 12) >= 1 ? meridiemUppercase[1] : meridiemUppercase[0]
      },

      // am, pm
      'a': function (date) {
        return (date.getHours() / 12) >= 1 ? meridiemLowercase[1] : meridiemLowercase[0]
      },

      // a.m., p.m.
      'aa': function (date) {
        return (date.getHours() / 12) >= 1 ? meridiemFull[1] : meridiemFull[0]
      }
    }

    // Generate ordinal version of formatters: M -> Mo, D -> Do, etc.
    var ordinalFormatters = ['M', 'D', 'DDD', 'd', 'Q', 'W']
    ordinalFormatters.forEach(function (formatterToken) {
      formatters[formatterToken + 'o'] = function (date, formatters) {
        return ordinal(formatters[formatterToken](date))
      }
    })

    return {
      formatters: formatters,
      formattingTokensRegExp: buildFormattingTokensRegExp(formatters)
    }
  }

  function ordinal(number) {
    return number + '일'
  }

  DateFns.locale = {
    ko: {
      locale: {
        distanceInWords: buildDistanceInWordsLocale(),
        format: buildFormatLocale()
      }
    }
  };

  const {
    format: fm,
    distanceInWords: diw,
    distanceInWordsStrict: diws,
    distanceInWordsToNow: diwtn
  } = DateFns;

  const diwOptions = options => Object.assign({}, ko, options);

  const baseFormat = date =>
    DateFns.differenceInYears(date, new Date) == 0 ?
      'MMM Do A h:m' : 'YYYY년 MMM Do A h:m';

  Object.assign(DateFns, {
    format: (date, format) =>
      format ?
        fm(date, format, ko)
      :
      DateFns.differenceInDays(date, new Date) == 0 ?
        DateFns.distanceInWordsToNow(date, {
          addSuffix: true, includeSeconds: true
        })
      :
      fm(date, baseFormat(date), ko)
    ,
    distanceInWords(dateToCompare, date, options) {
      return diw(dateToCompare, date, diwOptions(options));
    },
    distanceInWordsStrict(dateToCompare, date, options) {
      return diws(dateToCompare, date, diwOptions(options));
    },
    distanceInWordsToNow(date, options) {
      return diwtn(date, diwOptions(options));
    }
  });
} ();