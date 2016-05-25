FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI camel

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/httpToBusServer.js

COPY . ${InstallationDir}

RUN apk update && apk add --no-cache curl make gcc g++ git python && \
    npm install --verbose --production && \
    npm cache clean && \
    apk del curl make gcc g++ git python && \
    rm -fr /etc/ssl /var/cache/apk/* /tmp/*
