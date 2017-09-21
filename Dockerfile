FROM php:5.6-cli

COPY . /

RUN apt-get update && apt-get install -y npm node
RUN npm install

CMD ["/start-dev.sh"]