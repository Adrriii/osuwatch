'use strict';

class Command {

    setDM(dm) {
        this.dm = dm;
    }

    reply(msg, text) {
        msg.channel.send(text);
    }

    // Wether this command requires an admin role in order to be performed
    requires_admin() {
        throw new Error('Unimplemented method');
    }

    // Wether this command requires an admin role in order to be performed
    requires_data() {
        throw new Error('Unimplemented method');
    }

    // The method defining the behavior of the command
    async perform(msg) {
        throw new Error('Unimplemented method');
    }

}

module.exports = Command