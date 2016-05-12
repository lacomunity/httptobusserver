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

var express = require("express");
var BusToHttp = require("eyeos-BusToHttp");
var bodyParser = require('body-parser');
var settings = require('../../lib/settings');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (!settings.singleWorker && cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});
} else {
	createWebserver();
}

function createWebserver() {

	var app = express();

	app.use(bodyParser.json());

	app.use(function(req, res, next) {
		console.log('Request received!');
		res.status(200).send('Fake service responding!');
		next();
	});

	var servicePort = 6543;

	var server = app.listen(servicePort, function () {
		var host = server.address().address;
		var port = server.address().port;
		console.log('Fake Service listening at http://%s:%s', host, port);
	});

	var connectInfo = {
		busHost: settings.busHost,
		busPort: settings.busPort,
		queueName: 'httpToBusPerformanceTest.v1'
	};
	var busToHttp = new BusToHttp();

	busToHttp.start(connectInfo, "localhost", servicePort,  function () {
		console.log('Fake Service listening');
	});

}
