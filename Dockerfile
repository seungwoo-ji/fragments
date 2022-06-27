# Build fragment microservice api and serve it via express js 

# Stage 1: install the base dependencies
FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS dependencies

LABEL maintainer="Seung Woo Ji <swji1@myseneca.ca>" \
      description="Fragments node.js microservice"

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --production

###############################################################################

# Stage 2: run the fragments microservice server
FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS production

# Default service port
ENV PORT=8080 \
# Reduce npm spam (https://docs.npmjs.com/cli/v8/using-npm/config#loglevel)
    NPM_CONFIG_LOGLEVEL=warn \
# Disable color when run (https://docs.npmjs.com/cli/v8/using-npm/config#color)
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy the generated node dependencies
COPY --from=dependencies /app/node_modules /app/node_modules

COPY package*.json ./

COPY ./src ./src

COPY ./tests/.htpasswd ./tests/.htpasswd

CMD npm start

EXPOSE 8080
