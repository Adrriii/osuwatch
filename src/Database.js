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
        if(this.reconnecting) {
            return this.reconnecting_promise;
        }
        let reconnecting_promise = new Promise((resolve, reject) => {
            this.reconnecting = true;

            this.db.getConnection()
                .then(conn => {
                    console.log("Database reached");
                    
                    this.online = true;
                    this.reconnecting = false;
                    resolve();
                })
                .catch(async err => {
                    console.log("Error "+err);
                    this.online = false;

                    if(!this.online) {
                        await sleep(10000); // Prevent from crashing database with too many connections
                    }

                    this.reconnecting = false;
                    reject("Could not reconnect to the database");
                });
        });
        this.reconnecting_promise = reconnecting_promise;

        return this.reconnecting_promise;
    }

    async query(sql, opt = null){
        return new Promise((resolve,reject) => {
            try {
                this.db.query(sql, opt).then(
                    (res) => {
                        this.consec_fail = 0;
                        if(res == undefined) {
                            reject("Undefined result");
                            return;
                        }
                        if(res[0] && res[0].hasOwnProperty("res") && res[0].res === null){
                            this.result = null;
                        } // idfk but it doesn't crash this way
                        if(!res[0]) {
                            this.result = null;
                        } else {
                            this.result = res;
                        }
                        resolve();
                    }
                ).catch(e=>reject(e));
            } catch(e){
                console.log("Failed :\n"+e);
                this.consec_fail++;

                if(this.consec_fail<10) {
                    reject("Too many attempts");
                    return;
                }

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
        });
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
        if(!this.online) {
            console.log("DB not online");
            await this.reconnect();
        }

        return new Promise((resolve,reject) => {
            this.result = null;
            this.query(sql, opt).then(() => {
                resolve(this.getResult(i));
            }).catch(e => reject(e));
        })
    }
}

module.exports = Database;