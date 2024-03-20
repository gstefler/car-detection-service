FROM node:21-alpine as build
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn build

FROM node:21-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", "./.output/server/index.mjs"]

