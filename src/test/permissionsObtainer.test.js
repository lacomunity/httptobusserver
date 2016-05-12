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
var PermissionsObtainer = require('../lib/permissionsObtainer');
var HTTPRequest = require('../lib/HTTPRequest');

suite("PermissionsObtainer", function (v) {
	var sut, settings, vdiPerm, httpRequest;

	setup(function () {
		httpRequest = new HTTPRequest("GET /lol/v1/lerele HTTP/1.1\r\n\r\n", "test");
		vdiPerm = ['eyeos.lerele.exec'];
		settings = {
			permissions: {
				'GET /lol/v1/lerele': vdiPerm
			}
		};
		sut = new PermissionsObtainer(settings);
	});

	teardown(function () {

	});

	suite("#getPermissionsForRequest", function () {
		test("returns the array of permissions for the request URL", function () {
            var perms = sut.getPermissionsForRequest(httpRequest);
			assert.deepEqual(perms, vdiPerm, 'Returned wrong permissions');
		});

		test("returns empty array if the url is not specified in the configs", function () {
			settings.permissions = {};
			var perms = sut.getPermissionsForRequest(httpRequest);
			assert.deepEqual(perms, [], 'Returned wrong permissions');
		});
	});
});
