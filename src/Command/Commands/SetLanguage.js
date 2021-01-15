'use strict';

const Command = require("../Command.js");

class SetLanguage extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        let languages = [
            0, // English, default
            1, // French
        ]

        if(args[2] == undefined) {
            this.reply(msg, "Please specify a language value ");
            return;
        }

        if(isNaN(args[2])) {
            this.reply(msg, "Please specify a number ("+args[2]+" is not a valid number)");
            return;
        }

        let parsed = parseInt(args[2]);

        if(!languages.includes(parsed)) {
            this.reply(msg, "Please specify an available language");
            return;
        }

        this.dm.setLanguage(channel_id,parsed).then( (res) => {
            if(res) {
                switch(parsed) {
                    case 0:
                        this.reply(msg,"Notifications will be printed in English");
                        break;
                    case 1:
                        this.reply(msg,"Notifications will be printed in French");
                        break;
                    default:
                        this.reply(msg,"Notifications will be printed but idk in what language ? you should ping me");
                }
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

module.exports = SetLanguage