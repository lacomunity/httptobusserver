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

var HTTPRequest = require('../lib/HTTPRequest');

suite('HTTPRequest', function () {
	var sut;
	var method = "GET";
	var headerName = 'TID';
	var headerValue = '550e8400-e29b-41d4-a716-446655440000';
	var header = headerName + ': ' + headerValue;
	var request = method + " /test/test HTTP/1.1\r\nHost: whatever\r\n\r\n";
	var requestWithBody = method + " /test/test HTTP/1.1\r\nHost: whatever\r\n\r\na body with \r\n\r\n";
	var requestWithTIDHeader = method + " /test/test HTTP/1.1\r\nHost: whatever\r\n" + header + "\r\n\r\n";

	setup(function () {
		sut = new HTTPRequest(request);
	});

	suite('getUrl', function () {
		test('Should extract a valid url from the request', function(){
			var url = sut.getUrl();
			assert.equal(url, "/test/test", "Invalid URL");
		});
	});

	suite('getRawRequestWithHeader', function () {
		test('Should add provided header to the request', function(){
			var expectedRequest = "GET /test/test HTTP/1.1\r\nHost: whatever\r\n" + header + "\r\n\r\n";
			assert.equal(sut.getRawRequestWithHeader(headerName, headerValue), expectedRequest);
		});

		test('Should add provided header to the request even if there is a body with \r\n', function(){
			sut =  new HTTPRequest(requestWithBody);
			var expectedRequestWithBody = "GET /test/test HTTP/1.1\r\nHost: whatever\r\n" + header + "\r\n\r\na body with \r\n\r\n";
			assert.equal(sut.getRawRequestWithHeader(headerName, headerValue), expectedRequestWithBody);
		});

		test('Should not add the header if already exist en the request', function(){
			sut =  new HTTPRequest(requestWithTIDHeader);
		    var actualRawRequestWithHeader = sut.getRawRequestWithHeader(headerName, 'modifiedTIDValue');
			assert.equal(requestWithTIDHeader, actualRawRequestWithHeader, 'The request has been modified');
		});
	});

	suite('getHeaders', function () {
		test('Should return the headers', function () {
			var expected = {
				Host: "whatever",
				TID: headerValue
			};
			sut = new HTTPRequest(requestWithTIDHeader);
			var headers = sut.getHeaders();
			assert.deepEqual(headers, expected);
		});
	});

	suite("getMethod", function () {
		test('Should return the method of the request', function () {
			var res = sut.getMethod();
			assert(res, method);
		});
	});
});
