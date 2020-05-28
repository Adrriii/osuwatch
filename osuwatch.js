const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const readline = require('readline');

const DataManager = require('./src/DataManager');
const CommandHandler = require('./src/Command/CommandHandler');
const NotifMessage = require('./src/NotifMessage');

let dm = new DataManager();

let TEST = false;
let running = true;

const userconsole = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if(!config.has("Discord.token")) {
  throw("Please use default.json.example in config/ to fill in the bot token in default.json");
}

const token = config.get("Discord.token");

if(token == "BOT_TOKEN") {
  throw("Please configure the discord bot token in 'config/default.json'");
}

const usercommand = async (command) => {
  switch(command) {
    case "help":
      console.log("Commands are not yet implemented, except for 'exit'.");
      break;
    case "exit":
      running = false;
      client.destroy();
      break;
    case "db":
      await dm.test();
      break;
    case "test":
      await sendNotif(347650, false, true);
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

const sendNotif = async (nextPush, loved = false, test = false) => {
  if(TEST) test = true;

  let notifMessage = new NotifMessage();

  await notifMessage.init(dm,nextPush);

  dm.getTrackedChannels(loved, test).then( (channels) => {
    for(let i = 0; i < channels.length; i++) {
      notifChannel(notifMessage, channels[i]);
    }
  });
}

const notifChannel = async (notifMessage, channel) => {
  let notif = new NotifMessage();
  notif.import(notifMessage);
  notif.setForChannel(channel);

  if(notif.canceled) return;
  
  client.channels.fetch(channel["channel"]).then( (disc_channel) => {

    disc_channel.send(notif.embed).catch( (e) => {
      console.log("Failed to notify channel, "+e);
    });

  }).catch( (e) => {
    console.log("Could not notify "+channel["channel"]+", "+e);
  });
  
}

const rankedcheck = async () => {
  await dm.checkRankedBeatmap().then(async (nextPush) => {
    if (nextPush != undefined) {
      await dm.deleteRankedBeatmapQueue(nextPush);
      sendNotif(nextPush);
    }
  });

  await dm.checkLovedBeatmap().then(async (nextLovedPush) => {
    if (nextLovedPush != undefined) {
      await dm.deleteLovedBeatmapQueue(nextLovedPush);
      sendNotif(nextLovedPush, true);
    }
  });
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  userconsole.question('> ', usercommand);

  setInterval(rankedcheck,5000);
});

client.on('message', msg => {
  ch = new CommandHandler(dm);
  ch.handleCommand(msg);
});

client.login(token);

