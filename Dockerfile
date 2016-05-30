FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI camel

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/httpToBusServer.js

COPY . ${InstallationDir}

RUN apk update && \
    /scripts-base/installExtraBuild.sh && \
    npm install --verbose --production && \
    npm cache clean && \
    /scripts-base/deleteExtraBuild.sh && \
    rm -fr /etc/ssl /var/cache/apk/* /tmp/*
