Hacker News RSS
---------------
Generates an RSS 2.0 feed from the Hacker News API with [rssCloud](https://github.com/andrewshell/rsscloud-server) support

## Installation

```bash
git clone https://github.com/andrewshell/hacker-news-rss.git
cd hacker-news-rss
npm install
node app.js
```

## Env Variables

* **APP_HOST** What should be the url prefix in the feed for atom:self (default: http://hn.geekity.com)
* **PORT** What port is the app running on (default: 8080)
* **RSS_CLOUD_PING** URL of rssCloud server ping endpoint (default: http://rpc.rsscloud.io:5337/ping)
