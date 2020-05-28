'use strict';

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
            
            const mariadb = require('mariadb');
            const pool = mariadb.createPool({
                 host: config.get("db.host"), 
                 user: config.get("db.user"), 
                 password: config.get("db.pass"),
                 connectionLimit: 1
            });

            await pool.getConnection()
            .then(conn => {
            
                conn.query("use "+config.get("db.dbname"));
              console.log("Connected to database "+config.get("db.dbname"));
              this.db = conn;
                
            })
            
            this.online = true;
            return true;
        } catch(e){
            console.log("Error "+e);
            this.online = false;
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
        await this.query(sql, opt);
        return this.getResult(i);
    }
}

module.exports = Database;