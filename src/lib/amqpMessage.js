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

var AmqpMessage = function(queueName, body, id, replyTo, ack) {
	this.queueName = queueName;
	this.body = body;
	this.id = id;
	this.replyTo = replyTo;
	this.ack = ack;
};

AmqpMessage.prototype.getQueueName = function() {
    return this.queueName;
};

AmqpMessage.prototype.getBody = function() {
	return this.body;
};

AmqpMessage.prototype.getId = function() {
	return this.id;
};

AmqpMessage.prototype.getReplyTo = function() {
	return this.replyTo;
};

AmqpMessage.prototype.reject = function(requeue) {
	this.ack.reject(requeue);
}

AmqpMessage.prototype.acknow = function() {
	this.ack.acknowledge();
}

module.exports = AmqpMessage;
