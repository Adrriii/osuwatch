'use strict';

const LogMessage = require("./LogMessage");

class ChangedNickname extends LogMessage {
    
    constructor(old, now) {
        super();
        this.create(3119863, "Nickname updated", old+" is now "+ now);
    }
}

module.exports = ChangedNickname;