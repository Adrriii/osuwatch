'use strict';

const JoiningMessage = require("./JoiningMessage");

class NewUser extends JoiningMessage {
    
    constructor(username) {
        super();
        this.create(10181046, "Welcome!", username+" has registred to osudaily !");
    }
}

module.exports = NewUser;