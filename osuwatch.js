var requireDir = require('require-dir');

const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('config');
const readline = require('readline');

const DataManager = require('./src/DataManager');
const UserManager = require('./src/UserManager');
const CommandHandler = require('./src/Command/CommandHandler');
const NotifMessage = require('./src/NotifMessage');

const JoiningMessage = require('./src/JoiningMessages/JoiningMessage');
const JoiningMessages = requireDir('./src/JoiningMessages');

const MonitorMessage = require("./src/MonitorMessage");

let dm = new DataManager(client);
let um;
let mm;

let TEST = config.has("config.env") && config.get("config.env") != "prod"; // test unless prod
let running = true;

const serverconsole = readline.createInterface({
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

const consolecommand = async (command) => {
	// These commands are different from the actual discord user commands
	// They are the console commands
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
		serverconsole.question('> ', consolecommand);
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
		});

	}).catch( (e) => {
	});
	
}

const rankedCheck = async () => {
	if(TEST) return; // Do not interact with the prod bot

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

const joinCheck = async () => {
	dm.getNewUser().then(r => {
		if(r) {
			let msg = new JoiningMessages.NewUser(r.username);

			msg.send(client).then(o => {
				dm.removeNewUser(r.username);
			}).catch(console.error);
		}
	});
}

const heartbeat = () => {
	joinCheck();
	um.checkUsersRoles();
	mm.update();
};

const refresh = () => {
	um.checkUsersRoles();
};

client.on('ready', () => {
	console.log("Logged in as "+client.user.tag + ((!TEST) ? " in PRODUCTION mode !" : " in test mode"));

	client.guilds.fetch(config.main_server.id).then(guild => {
		um = new UserManager(client, dm, guild);
		refresh();
	});

	mm = new MonitorMessage(client, dm);

	serverconsole.question('> ', consolecommand);

	setInterval(rankedCheck,5000);
	setInterval(heartbeat,3000);
	setInterval(refresh,60000);
});

client.on('message', msg => {
	ch = new CommandHandler(dm);
	ch.handleCommand(msg);
});

client.login(token);

