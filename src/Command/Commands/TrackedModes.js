'use strict';

const Command = require("../Command.js");

class TrackedModes extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;
        
        
        await this.dm.getChannel(channel_id).then ( (channel_db) => {
            if(channel_db != undefined) {
        
                let modes = "";

                if (channel_db["std"] == 1) {
                    modes += "Standard ";
                }
                if (channel_db["taiko"] == 1) {
                    modes += "Taiko ";
                }
                if (channel_db["ctb"] == 1) {
                    modes += "Catch ";
                }
                if (channel_db["mania"] == 1) {
                    modes += "Mania ";
                }

                if (modes == "") {
                    modes = "None!";
                } else if (modes == "Standard Taiko Catch Mania ") {
                    modes = "All";
                }

                this.reply(msg,"This channel will get notifications for these modes : "+modes);
            } else {
                this.reply(msg,"This channel is not tracked. That means it won't received notifications. At all. What did you expect ?");
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

module.exports = TrackedModes