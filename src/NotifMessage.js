'use strict';
                
const Discord = require('discord.js');

class NotifMessage {

    import(notif) {
        this.beatmaps = notif.beatmaps;
        this.userid = notif.userid;

        this.initCached();
    }
    
    initCached() {
        let beatmapset_id = this.beatmaps[0]["beatmapset_id"];

        this.meta = {
            "title": this.beatmaps[0]["title"],
            "artist": this.beatmaps[0]["artist"],
            "creator": this.beatmaps[0]["creator"],
            "length": this.beatmaps[0]["total_length"],
            "approved_date": this.beatmaps[0]["approved_date"],
        };

        this.thumb = "https://a.ppy.sh";

        if (this.userid) {
            this.thumb = "https://a.ppy.sh/"+this.userid;
        }

        this.status = "";
        this.loved = false;
        switch (this.beatmaps[0]["approved"]) {
            case 1:
                this.status = "ranked";
                break;
            case 4:
                this.status = "loved";
                this.loved = true;
                break;
            case 3:
                this.status = "qualified";
                break;
            case 0:
                this.status = "pending";
                break;
        }

        this.embed = new Discord.MessageEmbed();

        this.embed.setColor(3447003);
        
        this.embed.setTitle((this.meta["artist"] + " - " + this.meta["title"]).replace(/\*/g, "\*"));

        this.embed.setURL("https://osu.ppy.sh/s/"+beatmapset_id);

        this.embed.setAuthor(
            "New "+this.status+" map by " + this.meta["creator"],
            this.thumb,
            "https://osu.ppy.sh/u/" + this.userid
        );

        this.embed.setThumbnail("https://b.ppy.sh/thumb/" + beatmapset_id + "l.jpg");

        const toMinSec = (s)=>{return(s-(s%=60))/60+(9<s?':':':0')+s};
        
        this.lines = "`Song length: " + toMinSec(this.meta["total_length"]) + "` ";
        
        this.lines += "\n[`Download`](https://osu.ppy.sh/d/" + this.meta["beatmapset_id"] + ") [`osu!direct`](osu://dl/" + this.meta["beatmapset_id"] + ")";
        this.lines += "\n\n";

        for(let i = 0; i < this.beatmaps.length; i++) {
            let diff = this.beatmaps[i];
            let mode = "osu!std";
            let keys = "";
            let AR = " AR" + diff["diff_approach"];
            switch (diff["mode"]) {
                case 0:
                    break;
                case 1:
                    mode = "osu!taiko";
                    break;
                case 2:
                    mode = "osu!ctb";
                    break;
                case 3:
                    mode = "osu!mania";
                    keys = " " + diff["diff_size"] + "k";
                    AR = "";
                    break;
            }
            this.lines += "**`" + Math.round(diff["difficultyrating"]*100)/100 + "☆ `[`[" + mode + keys+ "] " + diff["version"] + "`](https://osu.ppy.sh/b/" + diff["beatmap_id"] + ")**\n";
        }

        this.embed.setDescription(this.lines);

        this.embed.setFooter(this.meta["approved_date"]);

    }

    async init(dm, beatmapset_id) {
        await dm.getBeatmapSet(beatmapset_id).then(async  (beatmaps) => {
            await dm.getOsuID(beatmaps[0]["creator"]).then( (userid) => {
                this.beatmaps = beatmaps;
                this.userid = userid;

                this.initCached();
            })
        });
    }

    setForChannel(channel_db) {
        this.embed.setColor(channel_db["color"]);
        
        if (this.loved) {
            this.embed.setColor(0xff06ff);
        }
        
        switch (channel_db["language"]) {
            case 1:

                this.embed.setAuthor(
                    "Nouvelle map "+this.status+" de " + this.meta["creator"],
                    this.thumb,
                    "https://osu.ppy.sh/u/" + this.userid
                );

                this.lines.replace(/Song length/g, "Durée")

                this.embed.setDescription(this.lines);
                break;
            default:
        }
    }
}

module.exports = NotifMessage;