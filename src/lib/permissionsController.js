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

var EventEmitter = require('events').EventEmitter;
var PermissionsObtainer = require('./permissionsObtainer');
var PermissionsValidator = require('./permissionsValidator');
var logger = require('log2out');

function PermissionsController(httpServer, permissionsObtainer, permissionsValidator) {
	this.logger = logger.getLogger('PermissionsController');
	this.httpServer = httpServer;
	this.permissionsObtainer = permissionsObtainer || new PermissionsObtainer();
	this.permissionsValidator = permissionsValidator || new PermissionsValidator();
}

PermissionsController.prototype = Object.create(EventEmitter.prototype);

PermissionsController.prototype.start = function () {
	var self = this;
	this.httpServer.on("request", function (httpRequest) {
		var permissions = self.permissionsObtainer.getPermissionsForRequest(httpRequest);
		self.logger.debug('Permissions needed for request: ', permissions);
		var isValid = self.permissionsValidator.validate(httpRequest, permissions);
		self.logger.debug('request is valid? ', isValid);
		if(isValid) {
			self.emit('request', httpRequest);
		} else {
			self.emit('unauthorised', httpRequest);
		}
	});
};

module.exports = PermissionsController;
