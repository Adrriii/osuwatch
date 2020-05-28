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

    async isChannelTracked(channel_id) {
        let tracked = false;

        await DataManager.database.fast("SELECT * FROM watch_channels WHERE channel=?",[channel_id]).then(
            (res) => {
                tracked = res.length > 0;
            }
        );

        return tracked;
    }

    async addTrackedChannel(channel_id) {
        let ret = false;  
        
        await this.isChannelTracked(channel_id).then( async (tracked) => {
            if(!tracked) {
                await DataManager.database.fast("INSERT INTO watch_channels (channel) VALUES (?)", [channel_id]);
                ret = true;
            }
        });

        return ret;
    }

    async removeTrackedChannel(channel_id) {
        let ret = false;  
        
        await this.isChannelTracked(channel_id).then( async (tracked) => {
            if(tracked) {
                await DataManager.database.fast("DELETE FROM watch_channels WHERE channel=?", [channel_id]);
                ret = true;
            }
        });

        return ret;
    }

}

module.exports = DataManager;