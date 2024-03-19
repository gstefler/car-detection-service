FROM node:20.11.1-buster-slim

RUN apt-get update && apt-get install -y \
    gcc \
    python3

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD ["yarn", "start"]
