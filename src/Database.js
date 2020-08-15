'use strict';

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

class Database {

    constructor(){
        this.reconnect();
    }
    
    async reconnect() {
        try {
            const config = require('config');

            if(!config.has("db")) {
              throw("Please fill the db configs!");
            }

            console.log("Database reached");
            
            const mariadb = require('mariadb');
            const pool = mariadb.createPool({
                 host: config.get("db.host"), 
                 user: config.get("db.user"), 
                 password: config.get("db.pass"),
                 database: config.get("db.dbname"),
                 connectionLimit: 5
            });

            this.db = pool;
            
            this.online = true;

            return true;
        } catch(e){
            console.log("Error "+e);
            this.online = false;

            this.db.end()
            .then(() => {
                console.log("Ended pool");
            })
            .catch(err => {
                console.log("Could not end pool pool : "+err);
            });

            await sleep(10000); // Prevent from crashing database
            return false;
        }
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

            return true;
        } catch(e){
            console.log("Failed "+e);
            this.reconnect();
            return false;
        }
    }

    getResult(i = null){
        if(i == null){
            return this.result;
        }
        if(this.result[i] != undefined){
            return this.result[i];
        }
        return false;
    }

    async fast(sql, opt = null, i = null){
        this.result = null;
        await this.query(sql, opt);
        return this.getResult(i);
    }
}

module.exports = Database;