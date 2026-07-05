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
* **RSS_CLOUD_PING** URL of rssCloud server ping endpoint (default: https://rpc.rsscloud.io/ping)
* **RSS_MAXITEMS** Maximum number of items in RSS feed (default: 50)

## Docker

A published image is available at `ghcr.io/andrewshell/hacker-news-rss`. See
`scripts/README.md` for how images are built and tagged, and
`examples/dockge/compose.yaml` for a ready-to-paste [Dockge](https://github.com/louislam/dockge)
stack.

```bash
docker run -d -p 8080:8080 \
  -e APP_HOST=https://hn.example.com \
  ghcr.io/andrewshell/hacker-news-rss:latest
```

To build and push a new image yourself:

```bash
npm run docker:build-push
```
