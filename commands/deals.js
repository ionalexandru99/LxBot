const Discord = require('discord.js');
const epic = require('./modules/epic');
const ps = require('./modules/ps');
const psplus = require('./modules/psplus');
const nintendo = require('./modules/eshop');
const db = require('./modules/dbInterface');
const gamepass = require('./modules/gamepass');
require('dotenv').config();

module.exports = {
	name: 'deals',
	description: 'Deals for Games. Use the command `' + `${process.env.prefix}deals` + '` with any of the following arguments for different actions:'
		+ '\n\n:gear: **Channel Management** :gear:'
		+ '\n`activate`: Enable the current channel to use all deals commands in that channel (*Only one channel may be active at a time*)'
		+ '\n`deactivate`: Disable the current channel to use any deals commands in that channel'
		+ '\n\n:video_game: **Game Sales Tracking** :video_game:'
		+ '\n`epic`: Force check for free weekly games from Epic Games Store'
		+ '\n`gamepass` or `gp`: Force check for Xbox Game Pass games'
		+ '\n`ps`: View, Add, or Delete titles from the PlayStation Store to be tracked for sales'
		+ '\n`psplus` or `ps+`: Force check for monthly PS Plus games'
		+ '\n`eshop`: View, Add, or Delete titles from the Nintendo eShop to be tracked for sales'
		+ '\n',

	args: true,
	guildOnly: true,
	cooldown: 5,

	async execute(message, args, channel) {

		// Embed skeleton
		const configEmbed = new Discord.MessageEmbed().setAuthor('Tom Nook Configuration', process.env.configIcon);

		// Embed for channel activation
		function activateChannel(message) {
			return db.addChannel(message.channel).then(
				savedChannel => {
					configEmbed.setTitle('Channel Management');
					if (savedChannel === 'none') {
						configEmbed.setDescription('**#' + message.channel.name + '** is open for business!');
						return message.channel.send(configEmbed);
					} else {
						console.log(savedChannel);
						configEmbed.setDescription('**#' + savedChannel + '** is currently the active channel!'
							+ '\nUse the `deactivate` argument first when changing active channels.');
						return message.channel.send(configEmbed);
					}
				})
				.catch(console.error);
		}
		//Embed for channel deactivation
		function deactivateChannel(message) {
			return db.deleteChannel().then(
				channel => {
					configEmbed.setTitle('Channel Deactivation')
					if (channel) {
						configEmbed.setDescription('**#' + channel + '** is closed!');
						return message.channel.send(configEmbed);
					} else {
						configEmbed.setDescription('There is currently no active channel!');
						return message.channel.send(configEmbed);
					}
				})
				.catch(console.error);
		}

		// Start of argument parsing
		if (channel) {
			//Allow channel deactivation from any channel (in case of deleted channel)
			if (args[0] === 'deactivate') {
				return deactivateChannel(message);
			}
			else if (message.channel === channel) {
				// Only proceed if the message comes from the activated channel
				if (args[0] === 'ps') {
					// PlayStation Menu
					return ps.menu(message, channel).then(() => false);
				}
				else if (args[0] === 'ps+' || args[0] === 'psplus') {
					// Force PlayStation Plus check
					return psplus.check(channel);
				}
				else if (args[0] === 'eshop') {
					// Nintendo eShop Menu
					return nintendo.menu(message, channel);
				}
				else if (args[0] === 'gamepass' || args[0] === 'gp') {
					// Force Xbox Game Pass check
					return gamepass.check(channel);
				}
				else if (args[0] === 'epic') {
					// Force Epic Games check
					return epic.check(channel);
				}
				else if (args[0] === 'test') {
					// Test argument
					return;
				}
				else if (args[0] === 'activate') {
					// Activate current channel
					return activateChannel(message);
				}
			}
		} else if (args[0] === 'activate') {
			// Activate current channel
			return activateChannel(message);
		} else {
			// Channel has not been activated
			configEmbed.setTitle('Channel Not Specified')
				.setDescription('Please use the `activate` argument in the channel you wish to enable!');
			return message.channel.send(configEmbed);
		}
	},
};
