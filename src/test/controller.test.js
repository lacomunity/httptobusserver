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
var Controller = require('../lib/controller');
var AmqpConnection = require('../lib/amqpConnection');
var HTTPServer = require('../lib/HTTPServer');
var HTTPRequest = require('../lib/HTTPRequest');
var settings = require("../lib/settings");
var AmqpMessage = require("../lib/amqpMessage");
var HTTPTransactionRequestFactory = require('../lib/HTTPTransactionRequestFactory');
var PermissionsController = require('../lib/permissionsController');

suite('Controller', function () {
	var sut, amqpConnection, amqpConnectionSendStub, httpServer, httpServerListenStub,
		amqpConnectionStartStub, amqpMessagetest, httpServerSendStub, httpTransactionRequest,
		httpTransactionRequest2, rawTransactionRequest, permissionsController, permissionsControllerStub;

	setup(function () {
		permissionsController = new PermissionsController();
		amqpConnection = new AmqpConnection();
		amqpConnectionSendStub = sinon.stub(amqpConnection, "send");
		amqpConnectionStartStub = sinon.stub(amqpConnection, "start");
		httpServer = new HTTPServer();
		httpServerListenStub = sinon.stub(httpServer, "listen");
		httpServerSendStub = sinon.stub(httpServer, "send");
		httpTransactionRequest = HTTPTransactionRequestFactory.getInstance(new HTTPRequest("GET /lol/v1/lerele HTTP/1.1\r\n\r\n", "test"));
		httpTransactionRequest2 = HTTPTransactionRequestFactory.getInstance(new HTTPRequest("GET /lol/v1?lerele=lol HTTP/1.1\r\n\r\n", "test"));
		rawTransactionRequest = 'raw transaction request';
		amqpMessagetest = new AmqpMessage("test-reply-queue", "test", "id", "test-reply-queue");
		permissionsControllerStub = sinon.stub(permissionsController, 'start');
		sut = new Controller(httpServer, amqpConnection, permissionsController);

	});

	suite('start', function () {
		test('Should call listen on httpServer when connection to amqp is ready', function () {
			sut.start();
			amqpConnectionStartStub.callArg(3);
			assert(httpServerListenStub.calledWith(settings.httpPort), "failed to call listen with port");
		});
		test('Should call amqpconnection.start', function () {
			sut.start(sut.replyTo);
			assert(amqpConnectionStartStub.calledWith(sut.replyTo, settings.busHost, settings.busPort),
				"Never called start with correct params");
		});
		test('Should not call listen on httpServer when connection to amqp is not ready', function () {
			sut.start();
			assert.isFalse(httpServerListenStub.called, "should no call listen if amqp failed");
		});

		test('Should call permissionsControler.start', function () {
			sut.start();
			sinon.assert.called(permissionsControllerStub);
		});
	});


	suite("events", function () {

		test("Should call send on amqpConnection for each request event received from HTTPServer", function () {
			sut.start();
			permissionsController.emit("request", httpTransactionRequest);
			assert(amqpConnectionSendStub.calledOnce, "Never called send");
		});

		test("Should send a amqpMessage to AmqpConnection when received a request", function () {
			sut.start();
			sinon.stub(httpTransactionRequest, 'getRawTransactionRequest').returns(rawTransactionRequest);
			permissionsController.emit("request", httpTransactionRequest);
			var amqpMessage = amqpConnectionSendStub.args[0][0];
			assert.equal(amqpMessage.getBody(), rawTransactionRequest, "Invalid body inside amqpMessage");
			assert.equal(amqpMessage.getQueueName(), "lol.v1", "Invalid queue");
			assert.equal(amqpMessage.getId(), httpTransactionRequest.getId(), "Invalid id");
			assert.equal(amqpMessage.getReplyTo(), sut.replyTo, "Invalid reply to");
		});

		test("Should send a amqpMessage to AmqpConnection when received a request with query parameters", function () {
			sut.start();
			sinon.stub(httpTransactionRequest2, 'getRawTransactionRequest').returns(rawTransactionRequest);
			permissionsController.emit("request", httpTransactionRequest2);
			var amqpMessage = amqpConnectionSendStub.args[0][0];
			assert.equal(amqpMessage.getBody(), rawTransactionRequest, "Invalid body inside amqpMessage");
			assert.equal(amqpMessage.getQueueName(), "lol.v1", "Invalid queue");
			assert.equal(amqpMessage.getId(), httpTransactionRequest2.getId(), "Invalid id");
			assert.equal(amqpMessage.getReplyTo(), sut.replyTo, "Invalid reply to");
		});

		test('Should send a httpResponse to HTTPServer when received a response', function(){
			 sut.start();
			 amqpConnection.emit("message", amqpMessagetest);
			 var httpResponse = httpServerSendStub.args[0][0];
			 assert.equal(httpResponse.getResponse(), amqpMessagetest.getBody(), "Invalid RawRequest inside httpResponse");
			 assert.equal(httpResponse.getId(), amqpMessagetest.getId(), "Invalid RawRequest inside httpResponse");
		 });

		test('Should send a httpResponse with error 401 when received a unauthorised message', function () {
			sut.start();
			permissionsController.emit("unauthorised", httpTransactionRequest);
			var httpResponse = httpServerSendStub.args[0][0];
			var expectedBody = 'HTTP/1.0 401 OK\r\n\r\n/Unauthorized.';
			assert.equal(httpResponse.getResponse(), expectedBody, "Invalid RawRequest inside httpResponse");
			assert.equal(httpResponse.getId(), httpTransactionRequest.getId(), "Invalid RawRequest inside httpResponse");
		});

	});
});
