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

var EventEmitter = require('events').EventEmitter;
var RawHTTPServer = require("./rawHTTPServer");
var HTTPRequest = require("./HTTPRequest");
var logger = require('log2out').getLogger('HTTPToBus');
var RawHTTPMessage = require("./rawHTTPMessage");
var HTTPResponse = require("./HTTPResponse");
var ObjectMap = require('./Map');

var HTTPServer = function(rawHTTPServer, HTTPTransactionRequestFactory) {
	this.rawHTTPServer = rawHTTPServer || new RawHTTPServer();
	this.HTTPTransactionRequestFactory = HTTPTransactionRequestFactory || require('./HTTPTransactionRequestFactory');
	this.TIDMap = null;

	if (typeof Map != 'undefined') {
		this.TIDMap = new Map();
	} else {
		this.TIDMap = new ObjectMap();
	}
};

HTTPServer.prototype.listen = function(port) {
	this.rawHTTPServer.listen(port);
	var self = this;
	this.rawHTTPServer.on("request", function(data, id){
		logger.debug("New request received: ", data, id);
		var httpRequest = new HTTPRequest(data, id);
		var httpTransactionRequest = self.HTTPTransactionRequestFactory.getInstance(httpRequest);
		self.TIDMap.set(id, httpTransactionRequest.getTIDHeader());
		self.emit("request", httpTransactionRequest);
	});

	this.rawHTTPServer.on("socketClosed", function(id){
		self.TIDMap.delete(id);
	});
};

HTTPServer.prototype.send = function(response){
	logger.debug("Sending response: ", response);

	var tid = this.TIDMap.get(response.getId());
	this.TIDMap.delete(response.getId());

	var rawHTTPMessageWithTID = new RawHTTPMessage(response.getResponse());
	rawHTTPMessageWithTID.addHeader(tid);

	var rawMessageBuffer = rawHTTPMessageWithTID.getRawHTTPMessage();
	var httpResponse = new HTTPResponse(rawMessageBuffer, response.getId());
	this.rawHTTPServer.send(httpResponse);
};

HTTPServer.prototype.stop = function (){
	this.rawHTTPServer.stop();
};

HTTPServer.prototype.__proto__ = EventEmitter.prototype;


module.exports = HTTPServer;
