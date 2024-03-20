FROM node:20.11.1-buster-slim as build
WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

RUN yarn generate

FROM node:20.11.1-buster-slim

RUN yarn global add http-server

COPY --from=build /usr/src/app/dist .

EXPOSE 8080

CMD ["http-server", "."]

