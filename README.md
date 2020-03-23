# できること

- 指定した条件でトレースリストを取得し、以下のように表示する
  - レイテンシで降順ソートで表示
  - 重複する API をまとめて表示(よりレイテンシが高い API を優先して表示)
  - URL パラメータ(UUID と数列)を `*` に置換して表示

```sh
# トレースリスト取得例
[6482] GET /hoge/v1/all_users
=> https://console.cloud.google.com/traces/traces?tid=11111111111111111111111111111111

[4700] GET /fuga/v1/posts/*
=> https://console.cloud.google.com/traces/traces?tid=22222222222222222222222222222222

[3303] GET /fuga/v1/all_users
=> https://console.cloud.google.com/traces/traces?tid=33333333333333333333333333333333
```

# 使い方

```sh
gcloud beta auth application-default login
git clone https://github.com/hiima/collect-stacktrace-list.git
cd collect-stacktrace-list
npm install
cp .env.example .env
# .env に検索条件を書き込む
node index.js
```

# .env の書き方

```
PROJECT_ID=xxxx-abcd1234
DURATION_DAYS=1
LATENCY_MS=2000
LABEL="/http/host:aaa.bbb.ccc /http/host:xxx.yyy.zzz"

LATENCY_HIGHEST=8000
LATENCY_HIGH=4000
LATENCY_MEDIUM=2000
LATENCY_LOW=1000
LATENCY_LOWEST=500
```

# 取得先 API の仕様

https://cloud.google.com/trace/docs/reference/v1/rest/v1/projects.traces
