'user strict';
var requireDir = require('require-dir');

const LogMessage = require('./LogMessages/LogMessage');
const LogMessages = requireDir('./LogMessages');

class User {

    constructor(discord_member, client) {
        this.client = client;        
        this.member = discord_member;
        this.user = discord_member.user;

        this.id = this.user.id;
        this.nickname = this.member.nickname;
        this.username = this.user.username;

        this.roles = {};
        this.member.roles.cache.forEach(role => {
            this.roles[role.id] = role;
        });
    }

    hasNickname() {
        return !(!(this.nickname));
    }

    getName() {
        if(this.hasNickname()) return this.nickname;
        return this.username;
    }

    hasRole(role_id) {
        return role_id in this.roles;
    }

    async addRole(role) {
        return new Promise((resolve,reject) => {
            this.member.roles.add(role).then(() => {
                new LogMessages.AddedRole(this.getName(), role.name).send(this.client);
                this.roles[role.id] = role;
                resolve();
            }).catch(reject);
        });
    }

    async removeRole(role) {
        return new Promise((resolve,reject) => {
            this.member.roles.remove(role).then(() => {
                new LogMessages.RemovedRole(this.getName(), role.name).send(this.client);
                delete this.roles[role.id];
                resolve();
            }).catch(reject);
        });
    }

    async changeNickname(nickname) {
        return new Promise((resolve,reject) => {
            this.member.setNickname(nickname).then(() => {
                new LogMessages.ChangedNickname(this.getName(), nickname).send(this.client);
                this.nickname = nickname;
                resolve();
            })
            .catch(reject);
        });
    }

}

module.exports = User;