const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const readline = require('readline');

let running = true;

const userconsole = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if(!config.has("Discord.token")) {
  throw("Please use auth.json.example in config/ to fill in the bot token in auth.json");
}

const token = config.get("Discord.token");

if(token == "BOT_TOKEN") {
  throw("Please configure the discord bot token in 'config/auth.json'");
}

const usercommand = (command) => {
  switch(command) {
    case "help":
      console.log("Commands are not yet implemented, except for 'exit'.");
      break;
    case "exit":
      running = false;
      client.destroy();
      break;
    default:
      console.log("Unknown command. Type 'help' for a list of commands.");
  }

  if(running) {
    userconsole.question('> ', usercommand);
  } else {
    console.log("Goodbye!");
    process.exit();
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  userconsole.question('> ', usercommand);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

client.login(token);
