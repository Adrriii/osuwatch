'use strict';

const JoiningMessage = require("./JoiningMessage");

class NewDonor extends JoiningMessage {
    
    constructor(username) {
        super();
        this.create(15105570, "Wow", username+" is now a Donor ! Thank you so much !");
    }
}

module.exports = NewDonor;