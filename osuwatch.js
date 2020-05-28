const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');

if(!config.has("Discord.token")) {
  throw("Please use auth.json.example in config/ to fill in the bot token in auth.json");
}

const token = config.get("Discord.token");

if(token == "BOT_TOKEN") {
  throw("Please configure the discord bot token in 'config/auth.json'");
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(token);