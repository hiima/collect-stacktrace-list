# できること

- 指定した条件でトレースリストを取得し、以下のように表示する
  - レイテンシで降順ソートで表示
  - 重複する API をまとめて表示(よりレイテンシが高い API を優先して表示)
  - URL パラメータ(UUID と数列)を `*` に置換して表示

```sh
# トレースリスト取得例
[abc][6482] GET /hoge/v1/all_users
=> https://console.cloud.google.com/traces/traces?tid=11111111111111111111111111111111

[abc][4700] GET /fuga/v1/posts/*
=> https://console.cloud.google.com/traces/traces?tid=22222222222222222222222222222222

[xyz][3303] GET /fuga/v1/all_users
=> https://console.cloud.google.com/traces/traces?tid=33333333333333333333333333333333
```

# 使い方

```sh
gcloud beta auth application-default login
git clone https://github.com/hiima/collect-stacktrace-list.git
cd collect-stacktrace-list
npm install
cp config.example.json config.json
# .env に検索条件を書き込む
node index.js
```

# config.json の書き方

```json
{
  "projectId": "xxxx-abcd1234",
  "durationDays": 1,
  "latencyMs": 2000,
  "labels": ["/http/host:aaa.bbb.ccc", "/http/host:xxx.yyy.zzz"],
  "latencyHighest": 8000,
  "latencyHigh": 4000,
  "latencyMedium": 2000,
  "latencyLow": 1000,
  "latencyLowest": 500,
  "hostNameReplacers": [
    {
      "hostName": "aaa.bbb.ccc",
      "replacer": "abc"
    },
    {
      "hostName": "xxx.yyy.zzz",
      "replacer": "xyz"
    }
  ]
}
```

# 取得先 API の仕様

https://cloud.google.com/trace/docs/reference/v1/rest/v1/projects.traces
