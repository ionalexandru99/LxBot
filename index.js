const fs = require('fs');
const Discord = require('discord.js');
const db = require('./commands/modules/dbInterface');
const schedule = require('./commands/modules/schedule');
require('dotenv').config();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let active = false;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
	db.testDB();
	db.setUpDB().then(() => {
        client.channels.fetch('1071133765365149736').then((channel) => {
            //schedule.epic(channel);
            schedule.gamepass(channel);
            schedule.psplus(channel);
            schedule.trackedTitles(channel);
        })
	})
});

// console.log(client.commands);

client.on('message', message => {

	// Check for prefix
	if (!message.content.startsWith(process.env.prefix) || message.author.bot) return;

	// Grab command from message
	const args = message.content.slice(process.env.prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	// Check if command exists
	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	// Prevent direct messages
	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply("You're not allowed to slide into my DMs");
	}

	// Check if arguments were sent when needed
	if (command.args && !args.length) {
		return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	// Execute command
	try {
		if (!active) {
			// Run only when not waiting for a user response to another command

			// Set cooldown for the command
			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

			db.getChannel().then(id => {
				active = true;
				const channel = client.channels.cache.get(id);
				command.execute(message, args, channel)
					.then(result => {
						active = false;
					})
					.catch(console.error);
			});
		}
	}
	catch (error) {
		console.error(error);
		return message.reply('There was an error trying to execute that command!');
	}

});

client.login(process.env.token);
