/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var eyeosAmqp = require('eyeos-amqp');
var AMQPDeclarer = eyeosAmqp.AMQPDeclarer;
var amqpConnectionFactory = eyeosAmqp.amqpConnectionFactory;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var logger = require('log2out').getLogger('AMQPConnection');
var AmqpMessage = require('./amqpMessage');
var settings = require('./settings');

var amqpConnection = function() {

};
util.inherits(amqpConnection, EventEmitter);

amqpConnection.prototype.send = function(amqpMessage) {
	this.connection.publish(amqpMessage.getQueueName(), amqpMessage.getBody(), {headers: {messageType: "raw"},
		correlationId: amqpMessage.getId(), replyTo: amqpMessage.getReplyTo()});
};

function onConnectionReady (connection, replyTo, ack, prefetchCount, cb) {
	logger.info('Connection to AMQP restored and waiting for messages.');
	this._start(connection, replyTo, ack, prefetchCount, cb);
}

function onConnectionError (err) {
	this.emit("error", err);
}

function onConnectionClose (err) {
	this.emit("error", new Error("AMQP Connection Closed"));
}

amqpConnection.prototype.start = function(replyTo, host, port, cb, useAck, prefetchCount){
	var ack = false;
	if(useAck) {
		ack = true;
	}
	if (prefetchCount === undefined) {
		prefetchCount = settings.prefetchCount;
	}
	var self = this;
	amqpConnectionFactory.getInstance({host: host, port: port, login: settings.login, password: settings.password,
		heartbeat: settings.busHeartbeat}, function(error, connection) {
		if (error) {
			self.emit("error", error);
			return;
		}
		self.onConnectionReadyCallback = onConnectionReady.bind(self, connection, replyTo, ack, prefetchCount, cb);
		self.onConnectionErrorCallback = onConnectionError.bind(self);
		self.onConnectionCloseCallback = onConnectionClose.bind(self);
        //we can ignore the error, eyeos-amqp is handling the error for us
        connection.on('ready', self.onConnectionReadyCallback);

		connection.on("error", self.onConnectionErrorCallback);
		connection.on("close", self.onConnectionCloseCallback);

		if(!error) {
			self._start(connection, replyTo, ack, prefetchCount, cb);
		}


	});
};

amqpConnection.prototype._start = function(connection, replyTo, ack, prefetchCount, cb) {
	this.connection = connection;
	var declarer = new AMQPDeclarer(connection);
	var self = this;
	declarer.declareQueue(replyTo, settings.defaultQueueSettings, function (queue) {
		self.queue = queue;

		queue.subscribe({ack: ack, prefetchCount: prefetchCount}, function (msg, headers, deliveryInfo, ack) {
			logger.info("Received amqpMessage", msg);

			var amqpMessage = new AmqpMessage(replyTo, msg.data, deliveryInfo.correlationId, deliveryInfo.replyTo, ack);
			self.emit("message", amqpMessage);

		}).addCallback(function(ok) {
			logger.info("add callback", ok);
			self.ctag = ok.consumerTag; // needed for queue.unsubscribe
		});
		if(cb) {
			cb();
		}
	});
};

amqpConnection.prototype.stop = function () {
	logger.info("Stop subscription to queue");
	this.connection.removeListener('ready', this.onConnectionReadyCallback);
	this.connection.removeListener('error', this.onConnectionErrorCallback);
	this.connection.removeListener('close', this.onConnectionClose);
	this.queue.unsubscribe(this.ctag);
};

module.exports = amqpConnection;
