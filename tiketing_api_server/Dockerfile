FROM keymetrics/pm2:latest-jessie

COPY . .

RUN yarn install
RUN yarn run build

EXPOSE 8080

CMD ["pm2-runtime", "start", "ecosystem.config.js"]