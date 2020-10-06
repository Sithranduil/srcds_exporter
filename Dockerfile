FROM alpine:latest
RUN apk add nodejs npm --no-cache
COPY . .
RUN npm install --only=prod

CMD ["node", "index.js"]
EXPOSE 9591