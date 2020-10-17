FROM node:current-alpine3.12
WORKDIR /data
RUN npm install --only=prod
RUN npm install nodemon -g

# CMD ["node", "index.js"]
CMD ["nodemon", "index.js"]
EXPOSE 9591