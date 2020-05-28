'user strict';

class DataManager {

    constructor() {
        if(DataManager.database == null) {
            const Database = require("./Database.js");
            
            DataManager.database = new Database();
        }
    }
    
    isOnline() {
        return DataManager.database.online;
    }

    async test() {
       
       await DataManager.database.fast("SELECT * FROM osu_announce").then(
           (res) => {
                if(res.length >= 1) {
                    console.log("Database is online");
                } else {
                    console.log("Database doesn't seem to be online")
                }
            }
       );

    }

    async addTrackedChannel(channel_id) {  
        let ret = false;  
        let res1 = undefined; 
       
        await DataManager.database.fast("SELECT * FROM watch_channels WHERE channel=?",[channel_id]).then(
            (res) => {
                res1 = res;
            }
        );
        
        // Check if already tracked
        if(res1 == undefined || res1.length == 0) {
            await DataManager.database.fast("INSERT INTO watch_channels (channel) VALUES (?)", [channel_id]);
            ret = true;
        }

        return ret;
    }

}

module.exports = DataManager;