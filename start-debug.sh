#! /bin/sh

rabbitmq-server start -detached
sleep 1
node --debug-brk=5858 src/httpToBusServer.js
