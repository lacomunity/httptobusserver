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
var HashMap = require("hashtable");
var Uuid = require('node-uuid');
var logger = require('log2out').getLogger('rawHTTPServer');
var RawHTTPMessage = require('./rawHTTPMessage');

var RawHTTPServer = function (net, uuid) {
	this.net = net || require("net");
	this.map = new HashMap();
	this.uuid = uuid || Uuid;
};

RawHTTPServer.prototype.listen = function (port) {
	var self = this;
	this.server = this.net.createServer(function (sock) {
		// Content-Length is given in bytes, and utf-8 chars may be multi-byte
		var asciiRequest = "";
		// we store request as a utf-8 string because that's what we are going to
		// emit to the upper classes when we finish parsing the request
		var request = "";
		var receivedData = new Buffer(0);
		var alreadyEmitted = false;
		var id = self.uuid.v4();

		sock.on("data", function (data) {
			if (alreadyEmitted) {
				return;
			}
			request += data.toString('utf8');
			asciiRequest += data.toString('ascii');
			receivedData = Buffer.concat([receivedData, data]);

			var rawHttpMessage = new RawHTTPMessage(receivedData);
			var headerOffset = rawHttpMessage.getHeaderOffset();
			var lineBreakSize = rawHttpMessage.getLineBreakSize();

			if (headerOffset !== -1) {
				//search for keep-alive...
				var regex = /\nConnection:\s?keep-alive/i;
				var match = regex.exec(asciiRequest);
				if (match) {
					self._failKeepAlive(sock, asciiRequest);
					return;
				}

				regex = /\nContent-Length:\s?(-?\d+)/i;
				match = regex.exec(asciiRequest);
				if (!match) {
					self.map.put(id, sock);
					alreadyEmitted = true;
					self.emit("request", request, id);
				} else {
					var contentLength = match[1];

					var bodySize = asciiRequest.length - headerOffset - lineBreakSize;

					if (bodySize >= contentLength) {
						self.map.put(id, sock);
						alreadyEmitted = true;
						self.emit("request", request, id);
					}
				}
			}

		});

		sock.on('close', function () {
			logger.info('HTTP Socket closed, so remove: ', id, 'from HashMap');
			self._closeSocket(id);
		})

		sock.on('error', function(error) {
			logger.info('HTTP Socket error, so remove: ', id, 'from HashMap');
			logger.info(error.description);
			self._closeSocket(id);
		});

	});
	this.server.listen(port);
};

RawHTTPServer.prototype._closeSocket = function (id) {
	this.map.remove(id);
	this.emit("socketClosed", id);
};

RawHTTPServer.prototype._failKeepAlive = function (sock, asciiRequest) {
	try {
		sock.write('HTTP/1.0 200 OK\r\n\r\nThis server do not support keep-alive requests and its intended to be accesed through nginx');
	} catch (err) {
		logger.error('Received a request with Connection: keep-alive: ', err, '\n Some clients are accessing this service without nginx: ', asciiRequest);
	} finally {
		sock.end();
	}
};

RawHTTPServer.prototype.stop = function() {
	this.server.close();
};

RawHTTPServer.prototype.send = function (response) {
	var socket = this.map.get(response.getId());
	if (socket) {
		socket.write(response.getResponse());
		socket.destroy();
		delete socket;
	} else {
		//logger.info('Got an HTTP Response for a client that has closed the connection before getting any response');
	}

};

RawHTTPServer.prototype.__proto__ = EventEmitter.prototype;

module.exports = RawHTTPServer;
