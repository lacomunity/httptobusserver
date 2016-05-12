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



function RawHTTPMessage (rawHTTPMessage) {
	this.rawHTTPMessage = rawHTTPMessage;
	this._lineBreakSize = null;
	this._headerOffset = null;
}

RawHTTPMessage.prototype.getRawHTTPMessage = function () {
	return this.rawHTTPMessage;
};

RawHTTPMessage.prototype._analyzeRequest = function () {
	var utf8HttpMsg = this.rawHTTPMessage.toString('utf8');

	this._headerOffset = utf8HttpMsg.indexOf("\r\n\r\n");
	this._lineBreakSize = 4;

	if (this._headerOffset === -1) {
		this._headerOffset = utf8HttpMsg.indexOf("\n\n");
		this._lineBreakSize = 2;
	}
};

RawHTTPMessage.prototype.getHeaderOffset = function () {
	if(!this._headerOffset) {
		this._analyzeRequest();
	}
	return this._headerOffset;
};

RawHTTPMessage.prototype.getLineBreakSize = function () {
	if(!this._lineBreakSize) {
		this._analyzeRequest();
	}
	return this._lineBreakSize;
};


RawHTTPMessage.prototype.addHeader = function (header) {
	var headerOffset = this.getHeaderOffset();
	var utf8HttpMsg = this.rawHTTPMessage.toString('utf8');
	var utf8ResponseWithHeader = [utf8HttpMsg.slice(0, headerOffset), "\r\n", header, utf8HttpMsg.slice(headerOffset)].join('');

	this.rawHTTPMessage = new Buffer(utf8ResponseWithHeader, 'utf8');
	this._analyzeRequest();
	return this.rawHTTPMessage;
};

module.exports = RawHTTPMessage;
