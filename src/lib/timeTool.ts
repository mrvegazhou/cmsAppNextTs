const dateRegex = /(?=(YYYY|YY|MM|DD|HH|mm|ss|ms))\1([:/]*)/g;
const timespan = {
  YYYY: ['getFullYear', 4],
  YY: ['getFullYear', 2],
  MM: ['getMonth', 2, 1], // getMonth is zero-based, thus the extra increment field
  DD: ['getDate', 2],
  HH: ['getHours', 2],
  mm: ['getMinutes', 2],
  ss: ['getSeconds', 2],
  ms: ['getMilliseconds', 3],
};

function formatter(str?: string, date?: Date, utc?: boolean): string {
  if (typeof str !== 'string') {
    date = str;
    str = 'YYYY-MM-DD';
  }

  return str.replace(dateRegex, (match: string, key: keyof typeof timespan, rest?: string) => {
    const args = timespan[key];
    const chars = args[1];
    let name = args[0] as keyof Date;
    if (utc === true) {
      name = `getUTC${String(name).slice(3)}` as keyof Date;
    }
    if (!date) {
      date = new Date();
    }
    const val = `00${String((date[name] as typeof Date)() + (args[2] || 0))}`;
    return val.slice(-chars) + (rest || '');
  });
}

formatter.utc = (str?: string, date?: Date): string => {
  return formatter(str, date, true);
};

export default formatter;


/**
 * 时间转换
 * 刚刚	消息在60秒以内的
 * XXX分钟前	消息在1个小时以内
 * 10:23	消息是今天的，就只显示小时，分钟
 * 2020-02-10	消息是昨天及以前，就显示具体年月日
 * @params {String | Number} 时间字符串或者时间戳
 */
export const convertTimeToReadable = (time: string | number) => {

  // 拿到当前的时间戳（毫秒) -- 转换为秒
  let currentTime = new Date()
  let currentTimestamp = parseInt((currentTime.getTime() / 1000).toString());
  
  // 传进来的时间戳（毫秒)
  let t = new Date(time)
  let oldTimestamp = parseInt((t.getTime() / 1000).toString())
  
  // 年
  let oldY = t.getFullYear()
  // 月
  let oldM = t.getMonth() + 1
  // 日
  let oldD = t.getDate()
  // 时
  let oldH = t.getHours()
  // 分
  let oldi = t.getMinutes()
  // 秒
  let olds = t.getSeconds()
  
  // 相隔多少秒
  let timestampDiff = currentTimestamp - oldTimestamp
  if (timestampDiff < 60) { // 一分钟以内
    return "刚刚"
  }
  
  if (timestampDiff < 60 * 60) { // 一小时以内
      return Math.floor(timestampDiff / 60) + '分钟前'
  }
  
  // 今天的时间
  if (oldY === currentTime.getFullYear() && oldM === (currentTime.getMonth() + 1) && oldD === currentTime.getDate()) {
    // 10:22
      return `${zeroize(oldH)}:${zeroize(oldi)}`
  }
  
  // 剩下的，就是昨天及以前的数据
  return `${oldY}-${zeroize(oldM)}-${zeroize(oldD)}`
  
  // 补0
  function zeroize(num: number) {
      return num < 10 ? "0" + num : num
  }
}
