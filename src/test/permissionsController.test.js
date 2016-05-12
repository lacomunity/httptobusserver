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
var PermissionsController = require('../lib/permissionsController');
var HttpServer = require('../lib/HTTPServer');
var PermissionsObtainer = require('../lib/permissionsObtainer');
var PermissionsValidator = require('../lib/permissionsValidator');

suite("PermissionsController", function () {
	var sut, httpServer, permissionsObtainer, permissionsObtainerStub, permissions, httpRequest,
		permissionsValidator, permissionsValidatorStub;

	setup(function () {
		httpRequest = {};
		permissions = ['papuki'];
		permissionsObtainer = new PermissionsObtainer();
		permissionsValidator = new PermissionsValidator();
		httpServer = new HttpServer();
		sut = new PermissionsController(httpServer, permissionsObtainer, permissionsValidator);
	});

	teardown(function () {

	});

	suite("#start on httpServer request event", function () {
		setup(function() {
			permissionsObtainerStub = sinon.stub(permissionsObtainer, 'getPermissionsForRequest').returns(permissions);
			permissionsValidatorStub = sinon.stub(permissionsValidator, 'validate');
		});

		test("should call getPermissionsForRequest with httpRequest", function () {
            sut.start();
			httpServer.emit('request', httpRequest);
			sinon.assert.calledWithExactly(permissionsObtainerStub, httpRequest);
		});

		test("should call permissionsValidator validate with httpRequest and permissions", function() {
			permissionsValidatorStub.returns(true);
			sut.start();
			httpServer.emit('request', httpRequest);
			sinon.assert.calledWithExactly(permissionsValidatorStub, httpRequest, permissions);
		});
		
		test("should emit unauthorised on permissions validator returns false", function(done) {
			permissionsValidatorStub.returns(false);
			sut.start();
			sut.on('unauthorised', function(data) {
				assert.deepEqual(data, httpRequest);
				done();
			});
			httpServer.emit('request', httpRequest);
		});

		test("should emit request on permissions validator returns true", function (done) {
			permissionsValidatorStub.returns(true);
			sut.start();
			sut.on('request', function (data) {
				assert.deepEqual(data, httpRequest);
				done();
			});
			httpServer.emit('request', httpRequest);
		});
	});
});
