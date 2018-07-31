FROM node:alpine

# Build args
ARG APP_NAME mean-stack
ARG APP_REPOSITORY https://github.com/angusyg/mean-stack

RUN apk add --no-cache \
  git \
  openssh \
  python \
  make \
  g++

USER node

# Install pm2
RUN npm install pm2 -g

# Install pm2 log rotate and configure it
RUN pm2 install pm2-logrotate
RUN pm2 set pm2-logrotate:max_size 10M
RUN pm2 set pm2-logrotate:retain 10
RUN pm2 set pm2-logrotate:compress true
RUN pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
RUN pm2 set pm2-logrotate:rotateModule true
RUN pm2 set pm2-logrotate:workerInterval 30
RUN pm2 set pm2-logrotate:rotateInterval '0 0 * * *'

WORKDIR /usr/src

# App cloning
RUN git clone ${APP_REPOSITORY} app

WORKDIR /usr/src/app

# App checkout master branch
RUN git checkout master

# Client App install
WORKDIR /usr/src/app/client

RUN npm install
RUN npm run build:prod
RUN npm prune --production

# Server App install
WORKDIR /usr/src/app/server

RUN npm install
RUN npm prune --production

ENV NODE_ENV production
ENV PORT 3000
ENV TOKEN_SECRET JWTSECRET
ENV LOG_LEVEL info
ENV DB_URL 127.0.0.1:27017
ENV DB_NAME nean
ENV LOG_FOLDER /usr/src/app/server/logs
ENV PM2 true

# Expose app port
EXPOSE ${PORT}

WORKDIR /usr/src/app

# Monitor app with pm2
CMD ["pm2-runtime", "--json", "start", "pm2.config.js"]
