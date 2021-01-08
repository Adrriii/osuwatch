'use strict';

const LogMessage = require("./LogMessage");

class AddedRole extends LogMessage {
    
    constructor(username, role) {
        super();
        this.create(3798831, "Role updated", username+" is now "+ role);
    }
}

module.exports = AddedRole;