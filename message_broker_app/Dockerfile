FROM keymetrics/pm2:latest-jessie

COPY . .

RUN yarn install
RUN yarn run build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]