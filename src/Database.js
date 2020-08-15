'use strict';

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

class Database {

    constructor(){
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