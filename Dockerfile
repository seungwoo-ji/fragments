# Build fragment microservice api and serve it via express js 

FROM node:16.15.1

LABEL maintainer="Seung Woo Ji <swji1@myseneca.ca>" \
      description="Fragments node.js microservice"

# Default service port
ENV PORT=8080 \
# Reduce npm spam (https://docs.npmjs.com/cli/v8/using-npm/config#loglevel)
    NPM_CONFIG_LOGLEVEL=warn \
# Disable color when run (https://docs.npmjs.com/cli/v8/using-npm/config#color)
    NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./src ./src

COPY ./tests/.htpasswd ./tests/.htpasswd

CMD npm start

EXPOSE 8080
