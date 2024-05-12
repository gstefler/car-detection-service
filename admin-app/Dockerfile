FROM node:21-slim as build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build

FROM node:21-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", "./.output/server/index.mjs"]