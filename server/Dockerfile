FROM node:16.13-slim

RUN apt-get update && apt-get install -y ffmpeg unoconv imagemagick curl

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
RUN mkdir -p /home/node/app/files/thumbnail && chown -R node:node /home/node/app/files && chmod -R 775 /home/node/app/files


WORKDIR /home/node/app

#RUN  chmod -R 777 /home/node/app

COPY --chown=node:node package*.json ./

USER node

RUN npm install --loglevel=warn;

COPY --chown=node:node . .

EXPOSE 3001

CMD ["npm", "start"]