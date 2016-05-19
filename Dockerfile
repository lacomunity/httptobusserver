FROM docker-registry.eyeosbcn.com/eyeos-fedora21-node-base

ENV InstallationDir /var/service/
ENV WHATAMI camel

WORKDIR ${InstallationDir}

CMD eyeos-run-server --serf /var/service/src/httpToBusServer.js

RUN mkdir -p ${InstallationDir}/src/ && touch ${InstallationDir}src/httptobus-installed.js

COPY . ${InstallationDir}

RUN npm install --verbose && \
    npm cache clean
