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
var PermissionsValidator = require('../lib/permissionsValidator');
var HTTPTransactionRequestFactory = require('../lib/HTTPTransactionRequestFactory');
var HTTPRequest = require('../lib/HTTPRequest');
var EyeosAuth = require('eyeos-auth');

suite("PermissionsValidator", function () {
	var sut, eyeosAuth, permissions, httpTransactionRequest, card;
	var hasPermissionStub;
	var signature;
	setup(function () {
		eyeosAuth = new EyeosAuth();

		hasPermissionStub = sinon.stub(eyeosAuth, 'hasPermission');

		permissions = ['papuki'];
		signature = 'signature: Njm2NqPuGr+oFiow0diQoHwUs6dnEHZMkyXb66DNaIcKcgnrpapv7UuNchB56Wk3RVhHlxSPw0n/4J1Tu8u65g==';
		card = 'card: {"expiration":1428674135,"permissions":["papuki"],"renewCardDelay":12600,"username":"eyeos"}';
		httpTransactionRequest = HTTPTransactionRequestFactory.getInstance(new HTTPRequest("GET /lol/v1/lerele HTTP/1.1\r\n"
			+ card + "\r\n" + signature + "\r\n\r\n", "test"));
		sut = new PermissionsValidator(eyeosAuth);
	});

	teardown(function () {

	});

	suite("#validate", function () {
		test("returns true when the user has the correct permissions", function () {
			hasPermissionStub.returns(true);
            var res = sut.validate(httpTransactionRequest, permissions);
			assert.isTrue(res);
		});

		test("returns false when the user doesn't have the correct permissions", function () {
			hasPermissionStub.returns(false);
			var res = sut.validate(httpTransactionRequest, permissions);
			assert.isFalse(res);
		});

		test("returns true when no permissions are required", function () {
			hasPermissionStub.returns(false);
			var res = sut.validate(httpTransactionRequest, []);
			assert.isTrue(res);
		});
	});
});
