FROM node:21-slim

RUN apt-get update && apt-get install -y \
    gcc \
    python3

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY . .

CMD ["yarn", "start"]
