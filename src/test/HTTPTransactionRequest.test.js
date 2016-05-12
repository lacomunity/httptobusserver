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

var HTTPTransactionRequest = require('../lib/HTTPTransactionRequest');
var HTTPRequest = require('../lib/HTTPRequest');
var TIDHeader = require('../lib/TIDHeader');

suite('HTTPTransactionRequest', function () {
    var sut;
	var expectedSignature = "lkjh21kl13423ñlj1";
	var expectedCard = {"fakeCardKey": "fakeCardContent"};
	var expectedCardString = JSON.stringify(expectedCard);
    var expectedRequest = "GET / HTTP/1.0\r\ncard: " + expectedCardString + "\r\nsignature: " + expectedSignature + "\r\n\r\n";
    var expectedId = 'testid';
    var expectedUrl;
    var myHTTPRequest;
    var getRawRequestWithHeaderStub;
    var expHeaderName = 'X-eyeos-TID';
    var tidHeader;
	var expectedHeaders = {
		card: expectedCardString,
		signature: expectedSignature
	};
    setup(function () {
        tidHeader = new TIDHeader();
        myHTTPRequest = new HTTPRequest(expectedRequest, expectedId);
        sut = new HTTPTransactionRequest(tidHeader);
        sut.setRequest(myHTTPRequest);
    });

    suite('#getId', function () {
        test('Should return the id from HTTPRequest', function(){
            var id = sut.getId();
            assert.equal(id, expectedId, "Failed to get id from HTTPRequest");
        });
    });

    suite('#getRawRequest', function() {
        test('Should return the request from HTTPRequest', function(){
            expectedRequest = myHTTPRequest.getRawRequest();
            var request = sut.getRawRequest();
            assert.equal(request, expectedRequest, "Failed to get request from HTTPRequest");
        });
    });

    suite('#getUrl', function() {
        test('Should return the url from HTTPRequest', function(){
            expectedUrl = myHTTPRequest.getUrl();
            var url = sut.getUrl();
            assert.equal(url, expectedUrl, "Failed to get URL from HTTPRequest");
        });
    });

	suite('#getMethod', function () {
		test('Should return the method from HTTPRequest', function () {
			var expectedMethod = myHTTPRequest.getMethod();
			var res = sut.getMethod();
			assert.equal(res, expectedMethod, "Failed to get Method from HTTPRequest");
		});
	});

    suite('#getRawTransactionRequest', function() {

        test('Should return raw request with a transaction header in the request', function() {
            getRawRequestWithHeaderStub = sinon.stub(myHTTPRequest, 'getRawRequestWithHeader');
            sut.getRawTransactionRequest();
            assert(getRawRequestWithHeaderStub.calledWith(expHeaderName), 'Failed to add TID header');
        });

        test('Should add a transaction header to the request with same TID value', function(){
            var req1 = sut.getRawTransactionRequest();
            var req2 = sut.getRawTransactionRequest();
            assert.equal(req1, req2, "Failed the TID has changed");
        });

        test('Should add a transaction header to the request with diferent TID value for different instances', function(){
            var req1 = sut.getRawTransactionRequest();
            var sut2 = new HTTPTransactionRequest();
            sut2.setRequest(myHTTPRequest);
            var req2 = sut2.getRawTransactionRequest();
            assert.notEqual(req1, req2, "Failed to generate different TID for each instance");
        });
    });

    suite('#getTIDHeader', function() {

        test('Should return correct TID header', function(){
            var expectedHeader = 'X-eyeos-TID:' + tidHeader.TID;
            var actualHeader = sut.getTIDHeader();
            assert.equal(expectedHeader, actualHeader, 'Incorrect header returned');
        });

    });

    suite('#getCard', function () {
		test("Should return a card object", function () {
			var actualCard = sut.getCard();
			assert.deepEqual(actualCard, expectedCard, 'Incorrect card returned');
		});
	});

	suite('#getSignature', function () {
		test("Should return the signature", function () {
			var actualSignature = sut.getSignature();
			assert.deepEqual(actualSignature, expectedSignature, 'Incorrect signature returned');
		});
	});

	suite('#getHeaders', function () {
		test("Should return the headers", function () {
			var actualHeaders = sut.getHeaders();
			assert.deepEqual(actualHeaders, expectedHeaders, 'Incorrect headers returned');
		});
	});
});
