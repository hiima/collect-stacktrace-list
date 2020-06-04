const config = require('./config.json');

module.exports.replaceUrlParams = url => {
  const ewdRegex = /\d{8}_\d+_\d+_.+/g;
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g;
  const numberRegex = /^\d+$/g;
  const replacer = '*';
  return url
    .split('/')
    .map(x =>
      x
        .replace(ewdRegex, replacer)
        .replace(uuidRegex, replacer)
        .replace(numberRegex, replacer)
    )
    .join('/')
    .replace(/\/$/, '');
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
  const highest = { latency: config.latencyHighest || 8000, color: '\x1b[31m' };
  const high = { latency: config.latencyHigh || 4000, color: '\x1b[35m' };
  const medium = { latency: config.latencyMedium || 2000, color: '\x1b[33m' };
  const low = { latency: config.latencyLow || 1000, color: '\x1b[32m' };
  const lowest = { latency: config.latencyLowest || 500, color: '\x1b[36m' };
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
  console.log(`=> https://console.cloud.google.com/traces/traces?tid=${trace.traceId}`);
  console.log('');
};
