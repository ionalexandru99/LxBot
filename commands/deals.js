const Discord = require('discord.js');
const schedule = require('./modules/schedule');
const ps = require('./modules/ps4');
const nintendo = require('./modules/switch');
const db = require('./modules/dbInterface');
const update = require('./modules/update');

module.exports = {
	name: 'deals',
	description: 'Deals for games',
	args: true,
	// usage: '<user> <role>',
	guildOnly: true,
	cooldown: 5,
	// aliases: ['icon', 'pfp'],

	async execute(message, args, channel) {

		function messageEmbed(module, active) {
			return (
				new Discord.MessageEmbed()
					.setTitle('Module Activation')
					.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
					.setDescription(module.toUpperCase() + ' module is ' + (active ? 'activated' : 'deactivated') + '!')
			);
		}

		if (message.channel === channel) {
			if (channel || args[0] === 'activate') {
				if (args[0] === 'ps4') {
					ps.check(message, channel);
				}
				else if (args[0] === 'ps+' || args[0] === 'psplus') {
					db.manageModule('psplus').then(active => {
						message.channel.send(messageEmbed('psplus', active)).catch(console.error);
						schedule.psplus(active, channel);
					});
				}
				else if (args[0] === 'switch') {
					nintendo.check(message, channel);
				}
				else if (args[0] === 'epic') {
					db.manageModule(args[0]).then(active => {
						message.channel.send(messageEmbed(args[0], active)).catch(console.error);
						schedule.epic(active, channel);
					});
				}
				else if (args[0] === 'test') {
					update.update(channel, 'ps4');
				}
				else if (args[0] === 'activate') {
					db.addChannel(message.channel).then(savedChannel => {
						if (savedChannel === 'none') {
							const messageEmbed = new Discord.MessageEmbed()
								.setTitle('Channel Activation')
								.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
								.setDescription('**#' + message.channel.name + '** is open for business!');
							message.channel.send(messageEmbed);
						} else {
							console.log(savedChannel);
							const messageEmbed = new Discord.MessageEmbed()
								.setTitle('Channel Activation')
								.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
								.setDescription('**#' + savedChannel + '** is currently the active channel!');
							message.channel.send(messageEmbed);
						}
					});
				}
				else if (args[0] === 'deactivate') {

					db.deleteChannel().then(
						channel => {
							if (channel) {
								const messageEmbed = new Discord.MessageEmbed()
									.setTitle('Channel Deactivation')
									.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
									.setDescription('**#' + channel + '** is closed!');
								message.channel.send(messageEmbed);
							} else {
								const messageEmbed = new Discord.MessageEmbed()
									.setTitle('Channel Deactivation')
									.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
									.setDescription('There is currently no active channel!');
								message.channel.send(messageEmbed);
							}
						})
						.catch(console.error);
				}
			} else {
				const messageEmbed = new Discord.MessageEmbed()
					.setTitle('Channel Not Specified')
					.setAuthor('Tom Nook Configuration', 'https://www.mariowiki.com/images/2/26/SMO_8bit_Mario_Builder.png')
					.setDescription('Please enter `~deals activate` in the channel you wish to enable!');
				message.channel.send(messageEmbed);
			}
		}
	},
};

// Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >