'use strict';

const JoiningMessage = require("./JoiningMessage");

class NewSenior extends JoiningMessage {
    
    constructor(username) {
        super();
        this.create(3447003, "Congrats!", username+" is now a Senior User !");
    }
}

module.exports = NewSenior;