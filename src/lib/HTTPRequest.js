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

var HTTPRequest = function(request, id) {
	this.request = request;
	this.id = id;
};

HTTPRequest.prototype.getRawRequest = function() {
	return this.request;
};

HTTPRequest.prototype.getId = function() {
	return this.id;
};

HTTPRequest.prototype.getUrl = function() {
	var parseUrl = this.request.substr(0, this.request.indexOf("\n"));
	parseUrl = parseUrl.split(" ")[1];
	return parseUrl;
};

HTTPRequest.prototype.getRawRequestWithHeader = function(headerName, headerValue) {
	if(!this._headerInRequest(headerName)) {
		var header = headerName + ': ' + headerValue;
		var index = this.request.indexOf('\r\n\r\n');
		return this.request.substr(0, index) + '\r\n' + header + this.request.substr(index);
	} else {
		return this.request;
	}
};

HTTPRequest.prototype.getHeaders = function () {
	var reqItems = this.request.split('\r\n');
	var item, key, headers = {};
	for (var i = 1; i < reqItems.length; i++) {
		item = reqItems[i];
		if (item === "") {
			break;
		}

		key = item.split(": ")[0];
		headers[key] = item.replace(key + ": ", "");
	}

	return headers;
};

HTTPRequest.prototype.getType = function() {
    return "HTTPRequest";
};

HTTPRequest.prototype._headerInRequest = function(headerName) {
	return (this.request.indexOf(headerName) !== -1);
};

HTTPRequest.prototype.getMethod = function () {
	var parseUrl = this.request.substr(0, this.request.indexOf("\n"));
	return parseUrl.split(" ")[0];
};

module.exports = HTTPRequest;
