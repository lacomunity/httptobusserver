#!/bin/bash
set -e
set -u
mocha -u tdd -R spec src/test/
node src/integration-tests/amqpConnectionTest.js
