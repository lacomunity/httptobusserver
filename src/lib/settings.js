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

var settings = {
	singleWorker: process.env.HTTP_TO_BUS_SINGLE_WORKER === 'true' || false,
	httpPort: process.env.HTTP_TO_BUS_PORT || 8196,
	busPort: process.env.HTTP_TO_BUS_AMQP_PORT || 5672,
	busHost: process.env.HTTP_TO_BUS_AMQP_HOST || "172.17.0.1",
	login: process.env.EYEOS_BUS_MASTER_USER || "guest",
	password: process.env.EYEOS_BUS_MASTER_PASSWD || "guest",
	busHeartbeat: parseInt(process.env.HTTP_TO_BUS_AMQP_HEARTBEAT) || 1,
	prefetchCount: +process.env.HTTP_TO_BUS_PREFETCH_COUNT || 0,
	permissions: {
		"GET /vdi/v1/vm": ['eyeos.vdi.exec']
	},
	defaultQueueSettings: {
		autoDelete: false,
		durable: true
	}
};

module.exports = settings;
