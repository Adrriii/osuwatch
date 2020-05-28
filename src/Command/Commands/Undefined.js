'use strict';

const Command = require("../Command.js");

class Undefined extends Command {
    
    async perform(msg, args) {
        this.reply(msg, "Undefined command");
    }

    requires_admin() {
        return false;
    }

    requires_data() {
        return false;
    }

}

module.exports = Undefined