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

var sinon = require('sinon');
var assert = require('chai').assert;
var net = require('net');

var RawHTTPServer = require('../lib/rawHTTPServer');
var EventEmitter = require('events').EventEmitter;
var HTTPResponse = require('../lib/HTTPResponse');

suite('RawHTTPServer', function () {
	var sut, server, serverListenStub, netCreateServerStub, serverCloseStub;
	var port = 5555, fakeSocket, fakeSocket2;
	var getStringRet = "GET /lol HTTP/1.1\r\n\r\n";
	var getBufferRet = new Buffer(getStringRet, 'ascii');
    var getStringRetKA = "GET /lol HTTP/1.1\r\nConnection: keep-alive\r\n\r\n";
	var getBufferRetKA = new Buffer(getStringRetKA, 'ascii');
	var getString = "GET /lol HTTP/1.1\n\n";
	var getBuffer = new Buffer(getString, 'ascii');
	var incompleteGetString = "GET /lol HTTP/1.1";
	var incompleteGetBuffer = new Buffer(incompleteGetString, 'ascii');
	var postString = "POST /lol HTTP/1.1\r\nContent-Length: 4\r\n\r\ntest";
	var postBuffer = new Buffer(postString, 'ascii');
	var negPostString = "POST /lol HTTP/1.1\r\nContent-Length: -4\r\n\r\ntest";
	var negPostBuffer = new Buffer(negPostString, 'ascii');
	var zeroPostString = "POST /lol HTTP/1.1\r\nContent-Length: 0\r\n\r\n";
	var zeroPostBuffer = new Buffer(zeroPostString, 'ascii');
	var extraPostString = "POST /lol HTTP/1.1\r\nContent-Length: 4\r\n\r\ntesttestest";
	var extraPostBuffer = new Buffer(extraPostString, 'ascii');
	var incompletePostString = "POST /lol HTTP/1.1\r\nContent-Length: 20\r\n\r\ntest";
	var incompletePostBuffer = new Buffer(incompletePostString, 'ascii');
	var postStringIncompleteBy1 = "POST /lol HTTP/1.1\r\nContent-Length: 4\n\ntes";
	var postBufferIncompleteBy1 = new Buffer(postStringIncompleteBy1, 'ascii');

	var getStringChunk1 = "GET /lol HTTP";
	var getBufferChunk1 = new Buffer(getStringChunk1, 'ascii');
	var getStringChunk2 = "/1.1\r\n\r\n";
	var getBufferChunk2 = new Buffer(getStringChunk2, 'ascii');
	var postStringChunk1 = "POST /lol HTTP/1.1\r\nContent-Length: 4\r\n\r\nte";
	var postBufferChunk1 = new Buffer(postStringChunk1, 'ascii');
	var postStringChunk2 = "st";
	var postBufferChunk2 = new Buffer(postStringChunk2, 'ascii');

	var uuid = {
		v4: sinon.stub()
	};

	setup(function () {
		server = net.createServer();
		serverListenStub = sinon.stub(server, "listen");
		serverCloseStub =sinon.stub(server, "close");
		fakeSocket = new EventEmitter();
		fakeSocket.write = function() {};
		fakeSocket.end = function() {};
		fakeSocket.destroy = function() {};
		fakeSocket2 = new EventEmitter();
		sut = new RawHTTPServer(net, uuid);

	});


	teardown(function(){
		netCreateServerStub.restore();
	});

	suite('listen', function () {
		test('Should call listen on the server with correct port', function(){
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				return server;
			});
		    sut.listen(port);
			assert(serverListenStub.calledWith(port), "Never called listen correctly");

		});
	});
	suite('stop', function () {
		test('Should call close on the server', function(){
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				return server;
			});
			sut.listen(port);
			sut.stop();
			assert(serverCloseStub.calledOnce, "Never called close correctly");

		});
	});

	suite('events', function(){
		test('Should emit a request event when receives a complete GET with \r\n\r\n', function(done){
			sut.on("request", function(data){
				assert.equal(data, getStringRet, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', getBufferRet);
				return server;
			});
			sut.listen(port);
		});

        test('Should drop the connection if a keep-alive connection is received', function(){
            var fakeSocketEndStub = sinon.stub(fakeSocket, 'end');
            netCreateServerStub = sinon.stub(net, "createServer", function(cb){
                cb(fakeSocket);
                fakeSocket.emit('data', getBufferRetKA);
                assert(fakeSocketEndStub.calledOnce, "Keep-alive socket not closed");
                return server;
            });
            sut.listen(port);
        });

		test('Each request event should have a different id', function(){
			var firstId = false;
			sut.on("request", function(data, id){
				if(!firstId){
					firstId = id;
				} else {
					assert.notEqual(id, firstId, "Ids must be different");
				}

			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				cb(fakeSocket2);
				fakeSocket.emit('data', getBufferRet);
				fakeSocket2.emit('data', getBufferRet);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete GET with \n\n', function(done){
			sut.on("request", function(data){
				assert.equal(data, getString, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', getBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should not emit a request event when GET is incomplete', function(){
			sut.on("request", function(){
				throw "Got a request event with a incomplete GET";
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', incompleteGetBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete POST', function(done){
			sut.on("request", function(data){
				assert.equal(data, postString, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', postBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete POST with more data than the content length', function(done){
			sut.on("request", function(data){
				assert.equal(data, extraPostString, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', extraPostBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete POST with negative content lengh', function(done){
			sut.on("request", function(data){
				assert.equal(data, negPostString, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', negPostBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete POST with content-length = 0', function(done){
			sut.on("request", function(data){
				assert.equal(data, zeroPostString, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', zeroPostBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit only one request event ever', function(){
			var called = false;
			sut.on("request", function(data){
				if (called){
					throw "Recived two events";
				}
				assert.equal(data, negPostString, "Invalid request data");
				called = true;
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', negPostBuffer);
				fakeSocket.emit('data', getBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete GET splited in two chunks', function(done){
			sut.on("request", function(data){
				assert.equal(data, getStringChunk1+getStringChunk2, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', getBufferChunk1);
				fakeSocket.emit('data', getBufferChunk2);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit a request event when receives a complete POST splited in two chunks', function(done){
			sut.on("request", function(data){
				assert.equal(data, postStringChunk1+postStringChunk2, "Invalid request data");
				done();
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', postBufferChunk1);
				fakeSocket.emit('data', postBufferChunk2);
				return server;
			});
			sut.listen(port);
		});

		test('Should not emit a request event when POST is incomplete', function(){
			sut.on("request", function() {
				throw "Got a request event with a incomplete POST";
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', incompletePostBuffer);
				return server;
			});
			sut.listen(port);
		});

		test('Should not emit a request event when POST is incomplete by one', function(){
			sut.on("request", function(){
				throw "Got a request event with a incomplete POSTby1";
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', postBufferIncompleteBy1);
				return server;
			});
			sut.listen(port);
		});

		test('Should emit socketClosed with correlationId on error', function(done){
			var generatedUuid = 'someCorrelationId';
			uuid.v4.returns(generatedUuid);
			sut.on("socketClosed", function(correlationId){
				assert.equal(correlationId, generatedUuid);
				done();
			});

			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('error', new Error('some error'));
				return server;
			});

			sut.listen(port);
		});

	});

	suite("send", function(){
		test('Should call write on the corresponding socket with correct body', function(){
			var fakeSocketWriteStub = sinon.stub(fakeSocket, 'write');
			sut.on("request", function(data, id){
				var response = new HTTPResponse("test", id);
				sut.send(response);
				assert(fakeSocketWriteStub.calledWithExactly("test"), "Failed to send the response to the socket");
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', getBufferRet);
				return server;
			});
			sut.listen(port);
		});
		test('Should call socket end to close the connection after sending the response', function() {
			var fakeSocketEndStub = sinon.stub(fakeSocket, 'destroy');
			sut.on("request", function(data, id){
				var response = new HTTPResponse("test", id);
				sut.send(response);
				assert(fakeSocketEndStub.calledOnce, "Failed to close the socket");
			});
			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('data', getBufferRet);
				return server;
			});
			sut.listen(port);
		});
	});
	
	suite('sock.on close', function(){
		test('Should emit socketClosed with correlationId', function(done){
			sut.on("socketClosed", function(data){
				assert.isString(data, "Invalid correlationId");
				done();
			});

			netCreateServerStub = sinon.stub(net, "createServer", function(cb){
				cb(fakeSocket);
				fakeSocket.emit('close');
				return server;
			});

			sut.listen(port);
		});
	});
});
