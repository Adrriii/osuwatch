'use strict';

const config = require('config');
const Discord = require('discord.js');

class MonitorMessage {
    constructor(client, dm) {
        this.client = client;
        this.dm = dm;
        this.channel_id = config.main_server.monitoring_channel;

        this.embed = new Discord.MessageEmbed();
    }
    
    async update() {
        this.dm.getMonitorLog().then(async log => {
            this.embed.description = "Gather status | "+log.content;
            this.embed.color = log.color;
            await this.getCurrentMonitorMessage();
            this.embed.fields = [];
            await this.addRamField();
            await this.addSpaceField();
            await this.addCpuField();
    
            if(this.message)
                this.message.edit("",this.embed);
        })
    }

    async getCurrentMonitorMessage() {
        await this.client.channels.fetch(config.main_server.monitoring_channel).then( async channel => {
            await channel.messages.fetch({limit: 1}).then(messages => {
                this.message = messages.first();
            }).catch(console.error);
        }).catch(console.error);
    }

    async addRamField() {
        let field = {};
        this.embed.fields.push(field);
        
        let fs = require('fs');

        var info = {};
        var data = fs.readFileSync('/proc/meminfo').toString();
        data.split(/\n/g).forEach(function(line){
            line = line.split(':');
    
            // Ignore invalid lines, if any
            if (line.length < 2) {
                return;
            }
    
            // Remove parseInt call to make all values strings
            info[line[0]] = parseInt(line[1].trim(), 10);
        });

        field.name = "Ram usage";
        field.value = Math.round((info["MemTotal"] - info["MemFree"]) / 1024 / 1024 * 100)/100 + " GB / " + Math.round((info["MemTotal"] / 1024 / 1024) * 100)/100 + " GB";
        field.inline = true;
    }

    formatSpace(bytes) {
        let si_prefix = ['B', 'KB', 'MB', 'GB', 'TB', 'EB', 'ZB', 'YB'];
        let base = 1024;
        let clas = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), si_prefix.length - 1);
        return Math.round(bytes / Math.pow(base,clas) * 100) / 100 + ' ' + si_prefix[clas];
    }

    async addSpaceField() {
        return new Promise((resolve,reject) => {
            let field = {};
            this.embed.fields.push(field);
            
            let disk = require('diskfree');
    
            field.name = "Disk usage";
            field.value = "Err";
            field.inline = true;
    
            disk.check('/', (err, info) => {
                if(err) reject();

                field.value = this.formatSpace(info.total - info.available) + " / " + this.formatSpace(info.total);
                resolve();
            });
        });
    }

    async addCpuField() {
        return new Promise((resolve,reject) => {
            let field = {};
            this.embed.fields.push(field);

            var os = require('os-utils');

            field.name = "CPU usage";
            field.value = Math.round(os.loadavg(1)*10000)/100 + "%";
            field.inline = true;

            resolve();
        });
    }
}

module.exports = MonitorMessage;