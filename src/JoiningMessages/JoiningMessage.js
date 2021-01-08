'use strict';

const config = require('config');

const EmbedMessage = require("../EmbedMessage");

class JoiningMessage extends EmbedMessage {
    constructor() {
        super();
    }
    
    create(color, title, content) {
        super.create(config.main_server.joining_channel, color, title, content);
    }
}

module.exports = JoiningMessage;