FROM node:current-alpine3.12
WORKDIR /data
COPY . /data
RUN npm install --only=prod

CMD ["node", "index.js"]
EXPOSE 9591