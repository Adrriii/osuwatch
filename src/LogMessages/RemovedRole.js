'use strict';

const LogMessage = require("./LogMessage");

class RemovedRole extends LogMessage {
    
    constructor(username, role) {
        super();
        this.create(16199471, "Role updated", username+" is no longer "+ role);
    }
}

module.exports = RemovedRole;