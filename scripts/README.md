# Scripts

## docker-build-push.sh

Builds a multi-platform Docker image and pushes it to the GitHub Container
Registry as `ghcr.io/andrewshell/hacker-news-rss`.

### Features

- 🐳 **Docker validation** — checks Docker is running and you're authenticated to ghcr.io
- 🏷️ **Smart tagging** — tags with the version from `package.json`, the short git SHA, and `latest`
- 🎯 **Custom tags** — pass an extra tag as a positional argument
- 🚀 **Multi-platform** — builds `linux/amd64` and `linux/arm64` via `docker buildx`
- 🔍 **Dry run** — preview the tags without building/pushing

### Usage

```bash
# Full build and push
npm run docker:build-push

# Dry run — show what would happen without building/pushing
npm run docker:dry-run

# Direct script usage (e.g. with a custom tag)
./scripts/docker-build-push.sh beta
./scripts/docker-build-push.sh --help
```

### Requirements

- Docker installed and running, with `buildx`
- ghcr.io authentication (`docker login ghcr.io`) — the script prompts if needed;
  use a GitHub personal access token with the `write:packages` scope as the password
- Run from the repository root

### Tags pushed

- `ghcr.io/andrewshell/hacker-news-rss:<version>` (from `package.json`, currently `0.0.0`)
- `ghcr.io/andrewshell/hacker-news-rss:<git-sha>`
- `ghcr.io/andrewshell/hacker-news-rss:latest`
- `ghcr.io/andrewshell/hacker-news-rss:<custom-tag>` (if provided)

### Running the published image

The app keeps no on-disk state, so no volume is needed.

```bash
docker run -d -p 8080:8080 \
  -e APP_HOST=https://hn.example.com \
  ghcr.io/andrewshell/hacker-news-rss:latest
```

See `examples/dockge/compose.yaml` for a ready-to-paste Dockge stack.
