'use strict';

const config = require('config');

const EmbedMessage = require("../EmbedMessage");

class LogMessage extends EmbedMessage {
    constructor() {
        super();
    }
    
    create(color, title, content) {
        super.create(config.main_server.log_channel, color, title, content);
    }
}

module.exports = LogMessage;