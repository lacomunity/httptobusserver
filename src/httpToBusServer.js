#!/usr/bin/env node
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

var settings = require('./lib/settings.js');
var Notifier = require('eyeos-service-ready-notify');
var logger = require('log2out').getLogger('HTTPToBus');
var Controller = require("./lib/controller");

var AmqpConnection = require("./lib/amqpConnection");
var HTTPRequest = require('./lib/HTTPRequest');
var HTTPResponse = require('./lib/HTTPResponse');
var AmqpMessage = require('./lib/amqpMessage');
var HTTPTransactionRequestFactory = require('./lib/HTTPTransactionRequestFactory');
var TIDHeader = require('./lib/TIDHeader');


if(require.main === module) {
	logger.info(settings);
	var notifier = new Notifier();
	notifier.registerService();

	var controller = new Controller();
	controller.start();

} else {
	var exportedLibraries = {
		"AmqpConnection": AmqpConnection,
		"HTTPRequest" : HTTPRequest,
		"HTTPResponse": HTTPResponse,
		"AmqpMessage": AmqpMessage,
		"HTTPTransactionRequestFactory": HTTPTransactionRequestFactory,
		"TIDHeader": TIDHeader
	};

	module.exports = exportedLibraries;
}
