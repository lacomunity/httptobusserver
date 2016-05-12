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

var EyeosAuth = require('eyeos-auth');

function PermissionValidator(customEyeosAuth) {
	this.eyeosAuth = customEyeosAuth || new EyeosAuth;
}

PermissionValidator.prototype.validate = function (httpRequest, permissions) {
	var headers = httpRequest.getHeaders();
	var request = {
		headers: {
			card: headers.card,
			signature: headers.signature
		}
	};

	if (!permissions.length) {
		return true;
	}

	var self = this;
	for (var i = 0; i < permissions.length; i++) {
		if ( self.eyeosAuth.hasPermission(request, permissions[i])) {
			return true;
		}
	}

	return false;
};

module.exports = PermissionValidator;
