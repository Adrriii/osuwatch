'use strict';

const Command = require("../Command.js");

class Link extends Command {
    
    async perform(msg, args){
        let channel     = msg.channel;
        let channel_id  = channel.id;

        const config = require('config');

        if(!config.has("main_server.id") || !config.has("main_server.verified_role")) {
            this.reply(msg, "osu! account linking has not been set up");
            return;
        }

        if(channel.guild.id != config.get("main_server.id")) {
            this.reply(msg, "osu! account linking is not available for this server");
            return;
        }
        
        if(args.length != 3) {
            this.reply(msg, "Get your code at https://osudaily.net/link.php | Usage: `ow link [code]`");
            return;
        }
        
        let code = args[2];

        if(code == undefined) {
            this.reply(msg, "Please type a valid code. Get your code at https://osudaily.net/link.php");
            return;
        }

        await this.dm.linkDiscord(msg.author.id, code).then( async (info) => {
            if(info) {
                let append = ", but it seems that your account couldn't be checked.";

                await this.dm.isVerified(msg.author).then( (is_verified) => {

                    if(is_verified) {
                        msg.member.roles.add(config.get("main_server.verified_role")).catch(() => {});
                        msg.member.setNickname(info["username"]).catch(() => {}); // Sucks having to silence like that

                        append = ", and you were successfuly verified!";
                    }
                });
                
                this.reply(msg, "Your discord account has been linked with https://osu.ppy.sh/users/"+info["osu_id"]+append);
            } else {
                this.reply(msg, "This code couldn't be found. Get yours at https://osudaily.net/link.php");
            }
        });
    }

    requires_admin() {
        return false;
    }

    requires_data() {
        return true;
    }
}

module.exports = Link