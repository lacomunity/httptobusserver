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

var RestUtilsServer = require('RestUtils').Server;
var AuthFilterNothing = require('RestUtils').AuthFilterNothing;

var Router = function () {

};


Router.prototype.dispatch = function (analyzedRequest, httpResponse) {
	console.log('Request', analyzedRequest);
	httpResponse.end(analyzedRequest.headers);

};

var settings = {
		queueConfiguration: {
			type: "amqp",
			hosts: 'localhost:5672',
			queue: {
				name: 'lel.lel',
				durable: true,
				exclusive: false,
				autoDelete: false
			}
		}
};

var server = new RestUtilsServer(new Router(), settings.queueConfiguration, new AuthFilterNothing());

server.start();