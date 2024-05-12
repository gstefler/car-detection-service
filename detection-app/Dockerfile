FROM node:21-bullseye

WORKDIR /app

RUN mkdir images

COPY package.json .
COPY yarn.lock .

RUN yarn --ignore-engines

COPY . .

CMD ["yarn", "start"]
