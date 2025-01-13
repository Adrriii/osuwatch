'use strict';

const Command = require("../Command.js");

class Help extends Command {
    
    async perform(msg, args){
        this.reply(msg,"Welcome !\nTo receive notifications about new ranked maps on a channel, just type `ow add` in it !\n**All modes are enabled by default.**\n\nList of commands :"
        + "\n`ow add` Enable notifications on a channel"
        + "\n`ow remove` Disable notifications on a channel"
        + "\n`ow loved` Enable loved notifications on a channel"
        + "\n`ow removeloved` Enable loved notifications on a channel"
        + "\n`ow trackedmodes` Displays the channel's tracked modes"
        + "\n`ow setutc` Changes the UTC for this channel (default is 0)"
        + "\n`ow setlang` Changes the language (0: English, 1: French)"
        + "\n`ow addmode n` Enable notifications for a specific mode 'n'"
        + "\n`ow keyfilter k` Filter mania notifications to a specific keymode 'k' ('all', or from 1 to 18)"
        + "\n`ow rmmode n` Disable notifications for a specific mode 'n'\n(0=std, 1=taiko, 2=ctb, 3=mania, all=all modes)");
    }

    requires_admin() {
        return true;
    }

    requires_data() {
        return false;
    }
}

module.exports = Help