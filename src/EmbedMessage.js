'use strict';
                
const Discord = require('discord.js');
const config = require('config');

class EmbedMessage {
    
    create(channel_id, color, title, content) {
        this.channel_id = channel_id;

        this.embed = new Discord.MessageEmbed();

        this.embed.setColor(color);
        
        this.embed.setTitle(title);

        this.embed.setDescription(content);
    }

    send(client) {
        return new Promise((resolve, reject) => {
            client.channels.fetch(this.channel_id).then( (disc_channel) => {
                disc_channel.send(this.embed)
                .catch(e => reject(e))
                .then(m => resolve());  
            }).catch(e => reject(e));
        });
    }
}

module.exports = EmbedMessage;