'use strict';

const Command = require("../Command.js");

class RemoveMode extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        await this.dm.getChannel(channel_id).then ( (channel_db) => {
            if(channel_db == undefined) {
                this.reply(msg, "This channel is not even tracked ...");
                return;
            }

            let modes = [
                0, // Std
                1, // Taiko
                2, // CtB
                3, // Mania
            ]

            if(args[2] == undefined) {
                this.reply(msg, "Please specify a mode value ");
                return;
            }

            if(args[2] != "all") {
                if(isNaN(args[2])) {
                    this.reply(msg, "Please specify a number, or 'all' ("+args[2]+" is not a valid number)");
                    return;
                }

                let parsed = parseInt(args[2]);

                if(!modes.includes(parsed)) {
                    this.reply(msg, "Please specify an available mode");
                    return;
                }

                switch(parsed) {
                    case 0:
                        this.dm.trackModeChannel(channel_id,"std",0).catch(console.error);
                        this.reply(msg,"Standard is no longer a tracked mode");
                        break;
                    case 1:
                        this.dm.trackModeChannel(channel_id,"taiko",0).catch(console.error);
                        this.reply(msg,"Taiko is no longer a tracked mode");
                        break;
                    case 2:
                        this.dm.trackModeChannel(channel_id,"ctb",0).catch(console.error);
                        this.reply(msg,"Catch The Beat is no longer a tracked mode");
                        break;
                    case 3:
                        this.dm.trackModeChannel(channel_id,"mania",0).catch(console.error);
                        this.reply(msg,"Mania is no longer a tracked mode");
                        break;
                    default:
                        this.reply(msg,"Something went wrong");
                }
            } else {
                this.dm.trackModeChannel(channel_id,"std",0).catch(console.error);
                this.dm.trackModeChannel(channel_id,"taiko",0).catch(console.error);
                this.dm.trackModeChannel(channel_id,"ctb",0).catch(console.error);
                this.dm.trackModeChannel(channel_id,"mania",0).catch(console.error);
                this.reply(msg,"Ok, no mode will be tracked :(");
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

module.exports = RemoveMode