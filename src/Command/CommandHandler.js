'use strict';

var requireDir = require('require-dir');
var Commands = requireDir('./Commands');

class CommandHandler {

    constructor(dm) {
        this._dm = dm;
        this.prefix = "ow";
        this.admins = [217361209450692618]; // Adri
    }

    // Translates user input into the corresponding Class
    defineCommand(instruction) {
        let ret;
        switch (instruction) {
            case "add":
                ret = new Commands.Add();
                break;
            default:
                ret = new Commands.Undefined();
        }
        
        if(ret.requires_data()) {
            ret.setDM(this._dm);
        }
        return ret;
    }

    // Explodes the user input in order to get arguments of the command
    getArgs(text) {
        return text.split(' ');
    }

    // Gets the second word of the command, which should be the instruction
    getInstruction(text) {
        return this.getArgs(text)[1];
    }

    // Gets the first word of the command, which should be the prefix
    getPrefix(text) {
        return this.getArgs(text)[0];
    }

    // Wether the content of the message should be interpreted as a command
    isCommand(message) {
        let args = this.getArgs(message.content);
        let isValid = args.length > 1;
        
        let isCommand = false;
        if (isValid) {
            isCommand = this.getPrefix(message.content) == this.prefix;
        }
        
        // isCommand depends on isValid but this is the condition 
        // in case of future changes
        return isValid && isCommand;
    }

    // Wether the author of the message is an authorised person on this server
    userIsAdmin(message) {
        return (this.admins.includes(message.author.id) || message.channel.guild.ownerID == message.author.id)
    }

    // Performs the eventual command contained by a message
    handleCommand(message) {
        if (this.isCommand(message)) {
            let command = this.defineCommand(this.getInstruction(message.content));

            // Only run the command if user is admin or command doesn't need it
            if (!command.requires_admin() || this.userIsAdmin(message)) {
                command.perform(message);
            }
        }
    }

}

module.exports = CommandHandler