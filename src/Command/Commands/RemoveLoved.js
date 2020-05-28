'use strict';

const Command = require("../Command.js");

class RemoveLoved extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        await this.dm.isChannelTracked(channel_id).then( async (tracked) => {
            if(tracked) {
                this.dm.removeTrackedChannelLoved(channel_id).then( (res) => {
                    if(res) {
                        this.reply(msg,"This channel won't get loved notifications anymore :(");
                    }else{
                        this.reply(msg,"This channel is not even tracking loved maps yet =.=");
                    }
                })
            } else {
                this.reply(msg,"This channel is not even receiving notifications in the first place ...");
            }
        });
    }

    requires_admin() {
        return true;
    }

    requires_data() {
        return true;
    }
}

module.exports = RemoveLoved