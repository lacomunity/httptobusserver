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

var TIDHeader = require('./TIDHeader');

var HTTPTransactionRequest = function(tidHeader) {
    this.tidHeader = tidHeader || new TIDHeader();
};

HTTPTransactionRequest.prototype.setRequest = function(request) {
    this.httpRequest = request;
};

HTTPTransactionRequest.prototype.getId = function() {
    return this.httpRequest.getId();
};

HTTPTransactionRequest.prototype.getRawRequest = function() {
    return this.httpRequest.getRawRequest();
};

HTTPTransactionRequest.prototype.getRawTransactionRequest = function() {
    return this.httpRequest.getRawRequestWithHeader(this.tidHeader.getHeaderName(), this.tidHeader.getHeaderValue());
}

HTTPTransactionRequest.prototype.getUrl = function() {
    return this.httpRequest.getUrl();
};

HTTPTransactionRequest.prototype.getMethod = function () {
    return this.httpRequest.getMethod();
};

HTTPTransactionRequest.prototype.getType = function() {
    return "HTTPTransactionRequest";
};

HTTPTransactionRequest.prototype.getTIDHeader = function() {
    return this.tidHeader.getAsString();
};

HTTPTransactionRequest.prototype.getCard = function () {
    var headers = this.httpRequest.getHeaders();
    return JSON.parse(headers.card || '{}');
};

HTTPTransactionRequest.prototype.getSignature = function () {
    var headers = this.httpRequest.getHeaders();
    return headers.signature;
};

HTTPTransactionRequest.prototype.getHeaders = function () {
    return this.httpRequest.getHeaders();
};

module.exports = HTTPTransactionRequest;
