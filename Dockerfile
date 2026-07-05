FROM node:22 AS base

WORKDIR /app

COPY package.json ./

FROM base AS dependencies

RUN npm install --omit=dev

FROM dependencies AS runtime

COPY . .

# Default listen port (lib/config.js PORT default). Documentation only —
# override PORT at runtime and publish the matching port if you change it.
EXPOSE 8080

CMD ["node", "app.js"]
