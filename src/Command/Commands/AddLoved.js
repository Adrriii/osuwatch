'use strict';

const Command = require("../Command.js");

class AddLoved extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        await this.dm.isChannelTracked(channel_id).then( async (tracked) => {
            if(tracked) {
                this.dm.addTrackedChannelLoved(channel_id).then( (res) => {
                    if(res) {
                        this.reply(msg,"This channel will get loved notifications!");
                    }else{
                        this.reply(msg,"This channel already has loved notifications! (╯°□°）╯︵ ┻━┻");
                    }
                })
            } else {
                this.reply(msg,"You need to enable notifications in order to enable loved maps!");
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

module.exports = AddLoved