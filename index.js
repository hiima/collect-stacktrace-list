const moment = require('moment-timezone');
const { google } = require('googleapis');

const config = require('./config.json');
const { replaceUrlParams, distinctByApiName, printWithColor } = require('./helper');

async function main() {
  const filter = `${config.host} latency:${config.latencyMs}ms`;
  const startTime = moment()
    .subtract(config.durationDays, 'day')
    .tz('UTC')
    .format();
  const auth = await authorize();
  const request = {
    projectId: config.projectId,
    filter,
    startTime,
    view: 'ROOTSPAN',
    auth
  };

  const traces = await fetchTraces(request);

  distinctByApiName(traces).forEach(x => printWithColor(x));
}
main();

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
      startTime: traceSpan.startTime // debug用
    }))
  );
  // 二次元配列を一次元配列にする
  const result = [].concat(...temp);

  return result.filter(x => x.latency >= config.latencyMs).filter(x => x.method !== undefined);
}
