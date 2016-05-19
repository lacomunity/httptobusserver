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
var RawHTTPServer = require("../lib/rawHTTPServer");
var HTTPServer = require('../lib/HTTPServer');

suite('HTTPServer', function () {
	var sut, rawHTTPServerStub, rawHTTPServer, rawHTTPSendStub, rawHTTPServerStopStub;
	var port = 5555;
	var data = "GET /lol HTTP/1.1\r\n\r\n";


	setup(function () {
		rawHTTPServer = new RawHTTPServer();
		rawHTTPServerStub = sinon.stub(rawHTTPServer, "listen");
		rawHTTPServerStopStub = sinon.stub(rawHTTPServer, "stop");
		sut = new HTTPServer(rawHTTPServer);
	});

	suite('listen', function () {
		test('Should call rawHTTPServer listen', function(){
			sut.listen(port);
			assert(rawHTTPServerStub.calledWith(port), "Never called listen correctly");
		});
	});

	suite('stop', function () {
		test('Should call rawHTTPServer stop', function(){
			sut.stop();
			assert(rawHTTPServerStopStub.calledOnce, "Never called stop correctly");
		});
	});

	suite('Request events', function(){
		function execute(id) {
			id = id || "id";
			sut.listen(port);
			rawHTTPServer.emit("request", data, id);
		}

		test('Should emit a event request when received a event request', function(done){
			sut.on("request", function(request){
				assert.equal(request.getRawRequest(), data, "Invalid request data");
				assert.equal(request.getId(),"id", "Invalid request id");
				assert.equal(request.getType(),"HTTPTransactionRequest", "Object is not HTTPTransactionRequest");
				done();
			});
			execute();
		});

		test('Should save TID from request to TIDMap', function(done){
			var id = "id";
			sut.on("request", function(request){
				var tid = sut.TIDMap.get(id);
				assert.isDefined(tid, "TID not inserted in TIDMap");
				done();
			});
			execute(id);

		});
	});

	suite('socketClosed Event', function() {
		function execute(id) {
			id = id || "id";
			sut.listen(port);
			rawHTTPServer.emit("socketClosed", id);
		}
		
		test('Should.delete previously stored TID from TIDMap ', sinon.test(function(){
			var correlationId = 'id';
			sut.TIDMap.set(correlationId, 'myTID');
			execute(correlationId);
			assert.isUndefined(sut.TIDMap.get(correlationId));
		}));

	});

	suite("send", function() {
		var fakeResponse, correlationId, httpResponseBufferWithTID;

		setup(function () {
			var tid = "X-eyeos-TID:myTID";
			var httpResponseString = 'HTTP/1.0 200 OK\r\nContent-Lenght:40\r\n\r\n';
			var httpResponseBuffer = new Buffer(httpResponseString, 'ascii');
			var httpResponseStringWithTID = 'HTTP/1.0 200 OK\r\nContent-Lenght:40\r\n'+tid+'\r\n\r\n';
			httpResponseBufferWithTID = new Buffer(httpResponseStringWithTID, 'ascii');
			fakeResponse = {
				getId: function () {
				},
				getResponse: function () {
					return httpResponseBuffer;
				}
			};
			correlationId = 'anId';
			sinon.stub(fakeResponse, 'getId').returns(correlationId);
			sut.TIDMap.set(correlationId, tid);
		});
		function exercise() {
			sut.send(fakeResponse);
		}

		test("should.delete previously stored TID from TIDMap", sinon.test(function(){
			exercise();
			assert.isUndefined(sut.TIDMap.get(correlationId));
		}));

		test('should call rawHTTPServer.send with the TID header added to the passed response', function(done){
			rawHTTPSendStub = sinon.stub(rawHTTPServer, "send", function (httpResponse){
				var actualResponseBuffer = httpResponse.getResponse();
				assert.equal(actualResponseBuffer.toString('ascii'), httpResponseBufferWithTID.toString('ascii'));
				done();
			});

			exercise();
		});
	});
});
