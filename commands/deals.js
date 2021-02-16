const Discord = require('discord.js');
const schedule = require('./modules/schedule');
const ps = require('./modules/ps');
const nintendo = require('./modules/eshop');
const db = require('./modules/dbInterface');
const { prefix, configIcon } = require('../config.json');

const commandPrefix = process.env.prefix || prefix;
const commandIcon = process.env.configIcon || configIcon;

module.exports = {
	name: 'deals',
	description: 'Deals for Games. Use the command `' + `${commandPrefix}deals` + '` with any of the following arguments for different actions:'
		+ '\n\n:gear: **Channel Management** :gear:'
		+ '\n`activate`: Enable the current channel to use all deals commands in that channel (*Only one channel may be active at a time*)'
		+ '\n`deactivate`: Disable the current channel to use any deals commands in that channel'
		+ '\n\n:package: **Modules** :package:'
		+ '\n`epic`: Enable/Disable the Epic Games module which posts the free weekly games'
		+ '\n`psplus` or `ps+`: Enable/Disable the PS Plus module which posts the monthy games given'
		+ '\n\n:video_game: **Game Sales Tracking** :video_game:'
		+ '\n`ps`: View, Add, or Delete titles from the PlayStation Store to be tracked for sales'
		+ '\n`eshop`: View, Add, or Delete titles from the Nintendo eShop to be tracked for sales'
		+ '\n',

	args: true,
	guildOnly: true,
	cooldown: 5,

	execute(message, args, channel) {

		// Embed skeleton
		const configEmbed = new Discord.MessageEmbed().setAuthor('Tom Nook Configuration', commandIcon);

		// Embed for module management
		function moduleEmbed(module, active) {
			return (
				new Discord.MessageEmbed()
					.setTitle('Module Management')
					.setAuthor('Tom Nook Configuration', commandIcon)
					.setDescription(module.toUpperCase() + ' module is ' + (active ? 'activated' : 'deactivated') + '!')
			);
		}

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
					// PlayStation 
					return ps.menu(message, channel).then(() => false);
				}
				else if (args[0] === 'ps+' || args[0] === 'psplus') {
					// PlayStation Plus
					return db.manageModule('psplus').then(active => {
						schedule.psplus(active, channel);
						return message.channel.send(moduleEmbed('psplus', active)).catch(console.error);
					});
				}
				else if (args[0] === 'eshop') {
					// Nintendo eShop
					return nintendo.menu(message, channel);
				}
				else if (args[0] === 'epic') {
					// Epic Games
					return db.manageModule(args[0]).then(active => {
						schedule.epic(active, channel);
						return message.channel.send(moduleEmbed(args[0], active)).catch(console.error);
					});
				}
				else if (args[0] === 'test') {
					// Test argument
					return
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
