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
var RawHTTPMessage = require('../lib/rawHTTPMessage');

suite('RawHTTPMessage suite', function () {
	var sut;
	var rawHTTPMessage, httpMessage;


	setup(function () {
		constructRawHttpMessage();
	});

	function constructRawHttpMessage () {
		httpMessage = 'HTTP/1.0 200 OK\r\nContent-Lenght:40\r\n\r\n';
		rawHTTPMessage = new Buffer(httpMessage, 'ascii');
		sut = new RawHTTPMessage(rawHTTPMessage);
	}

	function constructRawHttpMessageSmallerLineBreak () {
		httpMessage = 'HTTP/1.0 200 OK\nContent-Lenght:40\n\n';
		rawHTTPMessage = new Buffer(httpMessage, 'ascii');
		sut = new RawHTTPMessage(rawHTTPMessage);
	}


	suite('#_analyzeRequest', function () {
		function exercise () {
			return sut._analyzeRequest();
		}

		suite('when new line is \r\n ', function(){
			test('returns a correct index', sinon.test(function () {
				exercise();
				assert.equal(sut._headerOffset, 34);
			}));
		});

		suite('when new line is \n ', function(){
			setup(function () {
				constructRawHttpMessageSmallerLineBreak();
			});
			test('returns a correct index', sinon.test(function () {
				exercise();
				assert.equal(sut._headerOffset, 33);
			}));
		});

	});

	suite('#getHeaderOffset', function(){
	    function exercise () {
		    return sut.getHeaderOffset()
	    }

		suite('when called and not calculated yet', function(){
			setup(function () {
				sut._headerOffset = null;
			});
		    test('should calculate it', sinon.test(function(){
		        var headerOffset = exercise();
			    assert.equal(34, headerOffset);
		    }));
		});


		suite('when called and already calculated', function(){
			test('should return stored val', sinon.test(function(){
				sut._headerOffset = 1111;
				exercise();
				assert.equal(sut._headerOffset, 1111);
			}));
		});
	});

	suite('#getLineBreakSize', function(){
		function exercise () {
			return sut.getLineBreakSize();
		}

	    suite('when called and new line is \r\n', function() {
		    test('returns correct new line offset', sinon.test(function () {
			    var offset = exercise();
			    assert.equal(offset, 4);
		    }));
	    });
	    suite('when called and new line is \n', function() {
		    setup(function () {
			    constructRawHttpMessageSmallerLineBreak();
		    });
		    test('returns correct new line offset', sinon.test(function () {
			    var offset = exercise();
			    assert.equal(offset, 2);
		    }));
	    });
	});

	suite('#addHeader', function(){
	    function exercise (header) {
		    return sut.addHeader(header);
	    }

		suite('when called', function(){
		    test('should add the passed header to the beginning of the http headers', sinon.test(function(){
			    var header='MyHeader:1234';
			    exercise(header);
			    var expectedHttpWithHeader = 'HTTP/1.0 200 OK\r\nContent-Lenght:40\r\nMyHeader:1234\r\n\r\n';
			    var actualHttpMsg = sut.rawHTTPMessage.toString('ascii');
			    assert.equal(actualHttpMsg, expectedHttpWithHeader);
		    }));
		});
	});

});
