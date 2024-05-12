FROM node:21-slim

WORKDIR /app

RUN mkdir images

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY index.js .

CMD ["yarn", "start"]
