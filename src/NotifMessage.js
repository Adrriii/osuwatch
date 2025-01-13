'use strict';
                
const Discord = require('discord.js');
const modeToString = require('./osu/modeToString.js');

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
        
        this.lines = "`Song length: " + toMinSec(this.meta["length"]) + "` ";
        
        this.lines += "\n[`Download`](https://osu.ppy.sh/d/" + beatmapset_id + ") [`osu!direct`](https://osudaily.net/osudirect.php?" + beatmapset_id + ")";
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
        await dm.getBeatmapSet(beatmapset_id).then(async (beatmaps) => {
            await dm.getOsuID(beatmaps[0]["creator"]).then( (userid) => {
                this.beatmaps = beatmaps;
                this.userid = userid;

                this.initCached();
            }).catch(console.error);
        }).catch(console.error);
    }

	checkKeyFilterBlock(channel_db) {
		// Cannot block if no key filter
		if(channel_db['keyfilter'] == 0) return false;

        for(let i = 0; i < this.beatmaps.length; i++) {
            let diff = this.beatmaps[i];
			// If the mode is not mania and it's tracked, we want the notification
			if (diff["mode"] != 3 && channel_db[modeToString(diff["mode"])] == 1) {
				return false;
			}
			// If the keyfilter is the same as the diff size, we want the notification
			if (diff["mode"] == 3 && (channel_db['keyfilter'] == diff["diff_size"])) {
				return false;
			}
		}
		// The mode does not match, or there is no matching keymode
		return true;
	}

    setForChannel(channel_db) {
        let hasTrackedMode = false;
        for(let i = 0; i < this.beatmaps.length; i++) {
            let diff = this.beatmaps[i];

			// If at least one mode is tracked, we want the notification
            if (channel_db[modeToString(diff["mode"])] == 1) {
                hasTrackedMode = true;
            }
        }

        if(!hasTrackedMode || this.checkKeyFilterBlock(channel_db)) {
            this.canceled = true;
            return;
        }

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