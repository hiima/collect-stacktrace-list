require('dotenv').config();

const moment = require('moment-timezone');
const { google } = require('googleapis');

const { replaceUrlParams, distinctByApiName, printWithColor } = require('./helper');

async function main() {
  // .env.LABELで"ホストA名 ホストB名"のように指定すると、複数のホストを監視対象にできる
  const tasks = process.env.LABEL.split(' ').map(async host => {
    const result = await task(host);
    return result;
  });

  // 監視対象のホストごとに取得したスタックトレースを一度スプレッドして一次元配列にする
  // [[ ホストAのスタックトレース ], [ ホストBのスタックトレース ]] => [ ホストAのスタックトレース, ホストBのスタックトレース ]
  const allTraces = [].concat(...(await Promise.all(tasks)));
  distinctByApiName(allTraces).forEach(trace => printWithColor(trace));
}
main();

async function task(label) {
  const startTime = moment()
    .subtract(process.env.DURATION_DAYS, 'day')
    .tz('UTC')
    .format();

  const request = {
    projectId: process.env.PROJECT_ID,
    filter: `${label} latency:${process.env.LATENCY_MS}ms`,
    startTime,
    view: 'ROOTSPAN',
    auth: await authorize()
  };

  const traces = await fetchTraces(request);
  return traces;
}

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  const authClient = await auth.getClient();
  return authClient;
}

async function fetchTraces(request) {
  let response;
  const traces = [];
  do {
    if (response && response.nextPageToken) {
      request.pageToken = response.nextPageToken;
    }
    // eslint-disable-next-line no-await-in-loop
    response = (await google.cloudtrace('v1').projects.traces.list(request)).data;
    traces.push(...response.traces);
  } while (response.nextPageToken);

  const temp = traces.map(trace =>
    trace.spans.map(traceSpan => ({
      latency: moment(traceSpan.endTime).diff(moment(traceSpan.startTime)),
      method: traceSpan.labels['/http/method'],
      name: replaceUrlParams(traceSpan.name),
      traceId: trace.traceId, // Trace URLの発行用
      startTime: traceSpan.startTime, // debug用
      host: traceSpan.labels['/http/host']
    }))
  );
  // 二次元配列を一次元配列にする
  const result = [].concat(...temp);

  return result
    .filter(x => x.latency >= process.env.LATENCY_MS)
    .filter(x => x.method !== undefined);
}
