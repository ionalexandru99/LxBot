const Discord = require('discord.js');
const schedule = require('./modules/schedule');
const ps = require('./modules/ps');
const nintendo = require('./modules/eshop');
const db = require('./modules/dbInterface');
const update = require('./modules/update');
const { prefix, configIcon } = require('../config.json');

module.exports = {
	name: 'deals',
	description: 'Deals for Games. Use the command `' + `${prefix}deals` + '` with any of the following arguments for different actions:'
		+ '\n\n:gear: **Channel Management** :gear:'
		+ '\n`' + `${prefix}deals` + ' activate`: Enable the current channel to use all deals commands in that channel (*Only one channel may be active at a time*)'
		+ '\n`' + `${prefix}deals` + ' deactivate`: Disable the current channel to use any deals commands in that channel'
		+ '\n\n:package: **Modules** :package:'
		+ '\n`' + `${prefix}deals` + ' epic`: Enable/Disable the Epic Games module which posts the free weekly games'
		+ '\n`' + `${prefix}deals` + ' psplus` or `' + `${prefix}deals` + ' ps+`: Enable/Disable the PS Plus module which posts the monthy games given'
		+ '\n\n:video_game: **Game Sales Tracking** :video_game:'
		+ '\n`' + `${prefix}deals` + ' ps`: View, Add, or Delete titles from the PlayStation Store to be tracked for sales'
		+ '\n`' + `${prefix}deals` + ' eshop`: View, Add, or Delete titles from the Nintendo eShop to be tracked for sales'
		+ '\n',

	args: true,
	// usage: '<user> <role>',
	guildOnly: true,
	cooldown: 5,
	// aliases: ['icon', 'pfp'],

	async execute(message, args, channel) {

		function messageEmbed(module, active) {
			return (
				new Discord.MessageEmbed()
					.setTitle('Module Management')
					.setAuthor('Tom Nook Configuration', configIcon)
					.setDescription(module.toUpperCase() + ' module is ' + (active ? 'activated' : 'deactivated') + '!')
			);
		}

		const configEmbed = new Discord.MessageEmbed().setAuthor('Tom Nook Configuration', configIcon);

		function activateChannel(message) {
			db.addChannel(message.channel).then(savedChannel => {

				configEmbed.setTitle('Channel Management');
				if (savedChannel === 'none') {
					configEmbed.setDescription('**#' + message.channel.name + '** is open for business!');
					message.channel.send(configEmbed);
				} else {
					console.log(savedChannel);
					configEmbed.setDescription('**#' + savedChannel + '** is currently the active channel!'
						+ '\nUse the `deactivate` argument first when changing active channels.');
					message.channel.send(configEmbed);
				}
			});
		}
		function deactivateChannel(message) {
			db.deleteChannel().then(
				channel => {
					configEmbed.setTitle('Channel Deactivation')

					if (channel) {
						configEmbed.setDescription('**#' + channel + '** is closed!');
						message.channel.send(configEmbed);
					} else {
						configEmbed.setDescription('There is currently no active channel!');
						message.channel.send(configEmbed);
					}
				})
				.catch(console.error);
		}
		if (channel) {
			if (args[0] === 'deactivate') {
				deactivateChannel(message);
			}
			else if (message.channel === channel) {
				if (args[0] === 'ps') {
					ps.check(message, channel);
				}
				else if (args[0] === 'ps+' || args[0] === 'psplus') {
					db.manageModule('psplus').then(active => {
						message.channel.send(messageEmbed('psplus', active)).catch(console.error);
						schedule.psplus(active, channel);
					});
				}
				else if (args[0] === 'eshop') {
					nintendo.check(message, channel);
				}
				else if (args[0] === 'epic') {
					db.manageModule(args[0]).then(active => {
						message.channel.send(messageEmbed(args[0], active)).catch(console.error);
						schedule.epic(active, channel);
					});
				}
				else if (args[0] === 'test') {
					// Test argument
				}
				else if (args[0] === 'activate') {
					activateChannel(message);
				}
			}
		} else if (args[0] === 'activate') {
			activateChannel(message);
		} else {
			configEmbed.setTitle('Channel Not Specified')
				.setDescription('Please use the `activate` argument in the channel you wish to enable!');
			message.channel.send(configEmbed);
		}
	},
};

// Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >