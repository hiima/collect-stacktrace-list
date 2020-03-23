require('dotenv').config();

module.exports.replaceUrlParams = url => {
  // '/UUID' と '/数列' を '/*' に置換する
  const uuidRegex = /\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g;
  const numberRegex = /\/[+-]?\d+/g;
  const replacer = '/*';
  return url.replace(uuidRegex, replacer).replace(numberRegex, replacer);
};

module.exports.distinctByApiName = arr => {
  // レイテンシで降順ソート
  const sorted = arr.sort((a, b) => b.latency - a.latency);
  // 重複する名前を持つTraceSpanを削除する(レイテンシがより高いTraceSpanが優先される)
  const distinct = sorted.reduce(
    (accumulator, current) =>
      accumulator.some(x => x.name === current.name && x.method === current.method)
        ? accumulator
        : [...accumulator, current],
    []
  );
  return distinct;
};

module.exports.printWithColor = trace => {
  const highest = { latency: process.env.LATENCY_HIGHEST || 8000, color: '\x1b[31m' };
  const high = { latency: process.env.LATENCY_HIGH || 4000, color: '\x1b[35m' };
  const medium = { latency: process.env.LATENCY_MEDIUM || 2000, color: '\x1b[33m' };
  const low = { latency: process.env.LATENCY_LOW || 1000, color: '\x1b[32m' };
  const lowest = { latency: process.env.LATENCY_LOWEST || 500, color: '\x1b[36m' };
  const resetColor = '\x1b[0m';

  const color = (() => {
    switch (true) {
      case trace.latency >= highest.latency:
        return highest.color;
      case trace.latency >= high.latency:
        return high.color;
      case trace.latency >= medium.latency:
        return medium.color;
      case trace.latency >= low.latency:
        return low.color;
      case trace.latency >= lowest.latency:
        return lowest.color;
      default:
        return resetColor;
    }
  })();

  console.log(`${color}[${trace.latency}]${resetColor} ${trace.method} ${trace.name}`);
  console.log(`:: ${trace.host}`);
  console.log(`=> https://console.cloud.google.com/traces/traces?tid=${trace.traceId}`);
  console.log('');
};
