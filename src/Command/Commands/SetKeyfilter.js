'use strict';

const Command = require("../Command.js");

class SetKeyfilter extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        if(args[2] == undefined) {
            this.reply(msg, "Please specify a keymode [1-18], or 'all'");
            return;
        }

        if(args[2] !== "all" && isNaN(args[2])) {
            this.reply(msg, "Please specify a number ("+args[2]+" is not a valid number)");
            return;
        }

        let parsed = args[2] !== "all" ? parseInt(args[2]) : 0;

        if(!(parsed >= 0 && parsed <= 18)) {
            this.reply(msg, "Please specify a number between 1 and 18 (got "+parsed+")");
            return;
        }

        this.dm.setKeyfilter(channel_id,parsed).then( (res) => {
            if(res) {
                this.reply(msg,"Maps will be filteterd to "+parsed+"K");
            } else{
                this.reply(msg,"Something went wrong, is this channel tracked ?");
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

module.exports = SetKeyfilter