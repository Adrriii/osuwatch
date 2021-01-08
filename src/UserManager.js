'user strict';
var requireDir = require('require-dir');
const config = require('config');

const User = require('./User');
const JoiningMessage = require('./JoiningMessages/JoiningMessage');
const JoiningMessages = requireDir('./JoiningMessages');

class UserManager {

    constructor(client, dm, main_guild) {
        this.client = client;
        this.main_guild = main_guild;
        this.dm = dm;
        
        this.users = {};
        this.working = false;
    }

    addUser(discord_member) {
        this.users[discord_member.user.id] = new User(discord_member, this.client);
    }

    removeUser(discord_member) {
        delete this.users[discord_member.user.id];
    }

    async refreshUsers() {
        this.users = {};

        await this.main_guild.members.fetch().then(async members => await members.forEach(member => this.addUser(member)));
    }

    async checkUsersRoles() {
        if(!this.main_guild) return;
        if(this.working) return;
        this.working = true;

        await this.refreshUsers();
	
        for(let user_id in this.users) {
            let user = this.users[user_id];
            await this.dm.getOsuMember(user.id).then(async osu_user => {

                let isOsuUser = osu_user;
    
                let isUser = user.hasRole(config.main_server.user);
                let isSenior = user.hasRole(config.main_server.senior);
                let isDonor = user.hasRole(config.main_server.donor);
    
                if(isOsuUser) {
                    osu_user = osu_user[0];
    
                    if(!isUser) {
                        // Add User role
                        await this.main_guild.roles.fetch(config.main_server.user).then(user_role => {
                            user.addRole(user_role);
                        }).catch(console.error);
                    }
    
                    if(osu_user["hourly"] == 1) {
                        if(!isDonor) {
                            // Add Donor role
                            await this.main_guild.roles.fetch(config.main_server.donor).then(user_role => {
                                user.addRole(user_role).then(() => {
                                    new JoiningMessages.NewDonor(osu_user.username).send(this.client);
                                });
                            }).catch(console.error);
                        }
                    }
    
                    // if user since more than 2yrs
                    if((new Date().getTime() - new Date(osu_user["sub_date"]).getTime()) / 1000 > 31536000 * 2) {
                        if(!isSenior) {
                            // Add Senior role
                            await this.main_guild.roles.fetch(config.main_server.senior).then(user_role => {
                                user.addRole(user_role).then(() => {
                                    new JoiningMessages.NewSenior(osu_user.username).send(this.client);
                                });
                            }).catch(console.error);
                        }
                    }
    
                    if((user.hasNickname() && osu_user.username != user.nickname)||(!user.hasNickname() && user.username != osu_user.username)) {
                        await user.changeNickname(osu_user.username).catch(console.error);
                    }
    
                } else {
                    if(isUser) {
                        // Remove User role
                        await this.main_guild.roles.fetch(config.main_server.user).then(user_role => {
                            user.removeRole(user_role);
                        }).catch(console.error);
                    }
                    if(isSenior) {
                        // Remove Senior role
                        await this.main_guild.roles.fetch(config.main_server.senior).then(user_role => {
                            user.removeRole(user_role);
                        }).catch(console.error);
                    }
                    // Fix username
                    if((user.hasNickname() && user.username != user.nickname)) {
                        await user.changeNickname(user.username).catch(console.error);
                    }
                }
            });
        }

        this.working = false;
    }
}

module.exports = UserManager;