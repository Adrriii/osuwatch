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

    async isChannelTrackedLoved(channel_id) {
        let tracked = false;

        await DataManager.database.fast("SELECT * FROM watch_channels WHERE channel=? AND loved=1",[channel_id]).then(
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

    async addTrackedChannelLoved(channel_id) {
        let ret = false;  
        
        await this.isChannelTrackedLoved(channel_id).then( async (tracked) => {
            if(!tracked) {
                await DataManager.database.fast("UPDATE watch_channels SET loved=1 WHERE channel=?", [channel_id]);
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

    async removeTrackedChannelLoved(channel_id) {
        let ret = false;  
        
        await this.isChannelTrackedLoved(channel_id).then( async (tracked) => {
            if(tracked) {
                await DataManager.database.fast("UPDATE watch_channels SET loved=0 WHERE channel=?", [channel_id]);
                ret = true;
            }
        });

        return ret;
    }

    async setLanguage(channel_id, val) {
        let ret = false;  
        
        await this.isChannelTracked(channel_id).then( async (tracked) => {
            if(tracked) {
                await DataManager.database.fast("UPDATE watch_channels SET language=? WHERE channel=?", [val, channel_id]);
                ret = true;
            }
        });

        return ret;
    }

    async setUTC(channel_id, val) {
        let ret = false;  
        
        await this.isChannelTracked(channel_id).then( async (tracked) => {
            if(tracked) {
                await DataManager.database.fast("UPDATE watch_channels SET utc=? WHERE channel=?", [val, channel_id]);
                ret = true;
            }
        });

        return ret;
    }

    async getChannel(channel_id) {
        let channel;
        await DataManager.database.fast("SELECT * FROM watch_channels WHERE channel=?",[channel_id]).then(
            (res) => {
                channel = res[0];
            }
        );
        return channel;
    }
    
    
    async checkRankedBeatmap() {
        let map;
        await DataManager.database.fast("SELECT MIN(beatmapset_id) FROM watch_unpushedBeatmapSets").then(
            (res) => {
                map = res[0][0];
            }
        );
        return map;
    }

    async checkLovedBeatmap() {
        let map;
        await DataManager.database.fast("SELECT MIN(beatmapset_id) FROM watch_unpushedBeatmapSetsLoved").then(
            (res) => {
                map = res[0][0];
            }
        );
        return map;
    }
    
    async deleteRankedBeatmapQueue(nextPush) {
        await DataManager.database.fast("DELETE FROM watch_unpushedBeatmapSets WHERE beatmapset_id=?",[nextPush]);
    }

    async deleteLovedBeatmapQueue(nextPush) {
        await DataManager.database.fast("DELETE FROM watch_unpushedBeatmapSetsLoved WHERE beatmapset_id=?",[nextPush]);
    }
    
    trackModeChannel(channel_id,mode,state) {
        DataManager.database.fast("UPDATE watch_channels SET "+mode+"=? WHERE channel=?",[state,channel_id]);
    }
    
    async getBeatmapSet(beatmapset_id) {
        let beatmaps;

        await DataManager.database.fast("SELECT * FROM osu_allbeatmaps WHERE beatmapset_id=? ORDER BY mode,difficultyrating DESC",[beatmapset_id]).then(
            (res) => {
                beatmaps = res;
            }
        );
        return beatmaps;
    }
    
    async getTrackedChannels(loved = false, test = false) {        
        let channels;

        let cond = "";
        if(test || loved) {
            cond = " WHERE";
            if(test)
                cond += " test=1";
            if(test && loved)
                cond += " AND";
            if(loved)
                cond += " loved=1";
        }

        await DataManager.database.fast("SELECT CONVERT(channel USING utf8) as channel, std, taiko, ctb, mania, language, utc, color, test, loved, keyfilter FROM watch_channels"+ cond).then(
            (res) => {
                channels = res;
            }
        );
        return channels;
    }
    
    async getUserId(name) {
        let osu_id;
        await DataManager.database.fast("SELECT osu_id FROM osu_user WHERE username=?",[name]).then(
            (res) => {
                if(res[0] != undefined)
                    osu_id = res[0]["osu_id"];
            }
        );
        return osu_id;
    }

    async getOsuID(username) {
        let userid;
        
        await this.getUserId(username).then( async (res) => {
            if(res == undefined) {
                // User not in the database
                const config = require('config');

                if(!config.has("osu.api_key")) {
                  console.log("Please fill the osu api token! Can't get unknown usernames");
                  return;
                }
    
                const fetch = require('node-fetch');
                let url = "https://osu.ppy.sh/api/get_user?k="+config.get("osu.api_key")+"&u="+username+"&type=string";
                let settings = { method: "Get" };
    
                await fetch(url, settings)
                    .then(async (res) => {
                        await res.json().then((decode) => {
                            userid = decode[0]["user_id"];
                        });
                    });
            } else {
                userid = res;
            }
        })

        return userid;
    }

}

module.exports = DataManager;