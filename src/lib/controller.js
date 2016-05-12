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

var Settings = require("./settings");
var HttpServer = require("./HTTPServer");
var AmqpConnection = require("./amqpConnection");
var AmqpMessage = require("./amqpMessage");
var HttpResponse = require("./HTTPResponse");
var logger = require('log2out').getLogger('Controller');
var uuid = require('node-uuid');
var PermissionsController = require('./permissionsController');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Controller = function(httpServer, amqpConnection, permissionsController) {
	this.httpServer = httpServer || new HttpServer();
	this.amqpConnection = amqpConnection || new AmqpConnection();
	this.replyTo = "httptobus-"+uuid.v4();
	this.permissionsController = permissionsController || new PermissionsController(this.httpServer);
};

util.inherits(Controller, EventEmitter);

Controller.prototype.start = function() {
	var self = this;
	this.amqpConnection.start(this.replyTo, Settings.busHost, Settings.busPort, function() {
		self.httpServer.listen(Settings.httpPort);
		logger.info("Connected to rabbit, accepting connections");
	});
	this.amqpConnection.on("error", function(err) {
		logger.error("AMQP Connection Error", err);
		self.emit('error', err);
	});
	this.amqpConnection.on("message", function(msg){
		logger.info("Received a response by amqp", msg.getBody().toString('utf-8'));
		var httpResponse = new HttpResponse(msg.getBody(), msg.getId());
		self.httpServer.send(httpResponse);
	});

	self.permissionsController.start();

	this.permissionsController.on("unauthorised", function (data) {
		logger.info("Received an unauthorised petition");
		var httpResponse = new HttpResponse('HTTP/1.0 401 OK\r\n\r\n/Unauthorized.', data.getId());
		self.httpServer.send(httpResponse);
	});

	this.permissionsController.on("request", function(data){

		var queueName = data.getUrl().split("/");
		var queryPos = queueName[2].indexOf("?");
		if(queryPos != -1) {
			queueName[2] = queueName[2].substr(0, queryPos);
		}
		queueName = queueName[1]+"."+queueName[2];

		var amqpMessage = new AmqpMessage(queueName, data.getRawTransactionRequest(),data.getId() , self.replyTo);
		logger.info("Sending to queue:", amqpMessage.getQueueName());
		self.amqpConnection.send(amqpMessage);
	});
};


module.exports = Controller;
