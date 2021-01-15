'use strict';

const Command = require("../Command.js");

class Add extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        this.dm.addTrackedChannel(channel_id).then( (res) => {
            if(res) {
                this.reply(msg,"This channel will get notifications!");
            }else{
                this.reply(msg,"This channel already has notifications! (╯°□°）╯︵ ┻━┻");
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

module.exports = Add