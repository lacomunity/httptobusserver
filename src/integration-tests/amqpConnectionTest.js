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

var AmqpConnection = require('../lib/amqpConnection');
var AmqpMessage = require('../lib/amqpMessage');

console.log("Runing AMQPConnection integration test");
console.log("--------------------------------------");


var amqpConnection = new AmqpConnection();
var amqpMessage = new AmqpMessage("test-reply-queue", "test", "id", "test-reply-queue");
var messageReceived = false;

amqpConnection.on("message", function(msg){
	messageReceived = true;
    if(msg.getBody().toString('utf-8') === 'test' && msg.getId() === "id") {
        console.log("AMQPConnection test: OK");
        amqpConnection.stop(); // remove queue connection
        process.exit(0);
    } else {
        fail();
    }

});


amqpConnection.start("test-reply-queue", "localhost", 5672, function(){
	amqpConnection.send(amqpMessage);
	setTimeout(function() {
		if(!messageReceived) {
            fail();
		}
	},2000);
});

function fail() {
    console.log("AMQPConnection test: ERROR ERROR ERROR ERROR!!!!!");
    process.exit(1);
}