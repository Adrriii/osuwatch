'use strict';

const Command = require("../Command.js");

class SetUTC extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        if(args[2] == undefined) {
            this.reply(msg, "Please specify a number");
            return;
        }

        if(isNaN(args[2])) {
            this.reply(msg, "Please specify a number ("+args[2]+" is not a valid number)");
            return;
        }

        let parsed = parseInt(args[2]);

        if(!(parsed >= -12 && parsed <= 12)) {
            this.reply(msg, "Please specify a number between -12 and 12 (got "+parsed+")");
            return;
        }

        this.dm.setUTC(channel_id,parsed).then( (res) => {
            if(res) {
                this.reply(msg,"Notifications will be printed with UTC"+ ((parsed>=0) ? "+"+parsed : parsed));
            }else{
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

module.exports = SetUTC