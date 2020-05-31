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
                if(res == undefined) return;
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
                if(res == undefined) return;
                tracked = res.length > 0;
            }
        );

        return tracked;
    }

    async isChannelTrackedLoved(channel_id) {
        let tracked = false;

        await DataManager.database.fast("SELECT * FROM watch_channels WHERE channel=? AND loved=1",[channel_id]).then(
            (res) => {
                if(res == undefined) return;
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

    async linkDiscord(user_discord_id, code) {
        let info = null;
        
        await DataManager.database.fast("SELECT osu_id,username FROM watch_user WHERE id = ?", [code]).then( (rep) => {
            if(rep != undefined) {
                info = rep[0];
            } else {
                info = false;
            }
        });

        if(info != false) {
            await DataManager.database.fast("UPDATE watch_user SET id = ? WHERE id = ?", [user_discord_id, code]);
        }

        return info;
    }

    async isVerified(member) {
        let ret = undefined;  
        
        // Check if in our users
        await DataManager.database.fast("SELECT * FROM watch_user as u WHERE u.id = ?", [member.id]).then( (rep) => {
            if(rep == undefined) ret = false;
        });

        if(ret != undefined && ret == false) return ret;
        
        // Check if active
        await DataManager.database.fast("SELECT consec_fail FROM osu_last as l, watch_user as u, osu_user as ou WHERE consec_fail>2 AND u.id = ? AND u.osu_id = ou.osu_id AND ou.id = l.id AND (SELECT selectedmods FROM osu_user as u, watch_user as w WHERE w.id = ? AND w.osu_id = u.osu_id) LIKE l.mode ORDER BY consec_fail ASC LIMIT 1", [member.id,member.id]).then( (rep) => {
            if(rep == undefined) ret = true;
        });

        if(ret != undefined && ret == false) return ret;

        ret = true;

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
                if(res == undefined) return;
                channel = res[0];
            }
        );
        return channel;
    }
    
    
    async checkRankedBeatmap() {
        let map;
        await DataManager.database.fast("SELECT MIN(beatmapset_id) as res FROM watch_unpushedBeatmapSets").then(
            (res) => {
                if(res == undefined) return;
                map = res[0]["res"];
            }
        );
        return map;
    }

    async checkLovedBeatmap() {
        let map;
        await DataManager.database.fast("SELECT MIN(beatmapset_id) as res FROM watch_unpushedBeatmapSetsLoved").then(
            (res) => {
                if(res == undefined) return;
                map = res[0]["res"];
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
                if(res == undefined) return;
                if(res[0].beatmapset_id == beatmapset_id)
                    beatmaps = res;
            }
        );

        if(beatmaps == undefined) {
            console.log("Couldn't get beatmap");
        }
        
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
                if(res == undefined) return;
                channels = res;
            }
        );
        return channels;
    }
    
    async getUserId(name) {
        let osu_id;
        await DataManager.database.fast("SELECT osu_id FROM osu_user WHERE username=?",[name]).then(
            (res) => {
                if(res == undefined) return;
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