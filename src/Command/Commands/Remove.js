'use strict';

const Command = require("../Command.js");

class Remove extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        this.dm.removeTrackedChannel(channel_id).then( (res) => {
            if(res) {
                this.reply(msg,"This channel won't get notifications anymore :(");
            }else{
                this.reply(msg,"This channel is not even tracked yet =.=");
            }
        }).catch(console.error);
    }

    requires_admin() {
        return true;
    }

    requires_data() {
        return true;
    }
}

module.exports = Remove