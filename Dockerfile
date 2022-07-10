# Build fragment microservice api and serve it via express js 

# Stage 1: install the base dependencies
FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS dependencies

LABEL maintainer="Seung Woo Ji <swji1@myseneca.ca>" \
      description="Fragments node.js microservice"

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

###############################################################################

# Stage 2: run the fragments microservice server
FROM node:16.15.1-alpine@sha256:c785e617c8d7015190c0d41af52cc69be8a16e3d9eb7cb21f0bb58bcfca14d6b AS production

# Default service port
ENV PORT=8080

WORKDIR /app

# Copy the generated node dependencies
COPY --chown=node:node --from=dependencies /app/node_modules /app/node_modules

COPY --chown=node:node . .

USER node

CMD ["node", "src/index.js"]

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080 || exit 1
