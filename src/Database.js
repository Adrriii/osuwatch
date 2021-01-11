'use strict';
const Discord = require('discord.js');

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

class Database {

    constructor(client){
        this.client = client;
        this.consec_fail = 0;
        
        const config = require('config');

        if(!config.has("db")) {
          throw("Please fill the db configs!");
        }
            
        const mariadb = require('mariadb');
        this.db = mariadb.createPool({
             host: config.get("db.host"), 
             user: config.get("db.user"), 
             password: config.get("db.pass"),
             database: config.get("db.dbname"),
             connectionLimit: 5
        });

        this.reconnect();
    }
    
    async reconnect() {

        await this.db.getConnection()
            .then(conn => {
                console.log("Database reached");
                
                this.online = true;
            })
            .catch(err => {
                console.log("Error "+err);
                this.online = false;
            });

        if(!this.online) {
            await sleep(10000); // Prevent from crashing database
        }

        return this.online;
        
    }

    async query(sql, opt = null){
        if(!this.online) {
            console.log("DB not online");
            this.reconnect();
            return false;
        }
        try {
            await this.db.query(sql, opt).then(
                (res) => {
                    if(res == undefined) return;
                    if(res[0] == undefined) return;
                    if(res[0].hasOwnProperty("res") && res[0].res === null) return; // idfk but it doesn't crash this way
                    this.result = res;
                }
            )

            this.consec_fail = 0;
            return true;
        } catch(e){
            console.log("Failed :\n"+e);
            this.consec_fail++;

            if(this.consec_fail<10) return;

            const config = require('config');

            let embed = new Discord.MessageEmbed();
    
            embed.setColor(15419709);
            
            embed.setTitle("Ooops!");
    
            embed.setDescription("I think the database just died ... Adri do something!");
        
            this.client.channels.fetch(config.main_server.main_channel).then( (disc_channel) => {
                disc_channel.send(embed)
                .catch(e => reject(e))
                .then(m => {
                    process.exit();
                });  
            }).catch(e => reject(e));
        }
    }

    getResult(i = null){
        let ret = false;
        if(i == null){
            ret = this.result;
        }
        if(this.result && this.result[i] != undefined){
            ret = this.result[i];
        }
        this.result = null;
        return ret;
    }

    async fast(sql, opt = null, i = null){
        this.result = null;
        await this.query(sql, opt);
        return this.getResult(i);
    }
}

module.exports = Database;