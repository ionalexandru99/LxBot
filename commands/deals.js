const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	name: 'deals',
	description: 'Deals for games',
	args: true,
	// usage: '<user> <role>',
	guildOnly: true,
	cooldown: 5,
	// aliases: ['icon', 'pfp'],
	async execute(message, args) {
		if (args[0] === 'ps4') {
			const exampleEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				// .setTitle('PlayStation 4 Deals')
				.attachFiles(['./icons/ps.png'])
				.setURL('https://discord.js.org/')
				// .setAuthor('Some name', 'attachment://ps.png', 'https://discord.js.org')
				.setAuthor('PlayStation 4 Deals', 'attachment://ps.png')
				.setDescription('**Select an option by entering its number:**' +
					'\n1) View List' +
					'\n2) Add to List' +
					'\n3) Remove from List');
			// .setThumbnail('attachment://ps.png')
			// .addFields(
			// 	{ name: '\u200B', value: '\u200B' },
			// 	{ name: '\u200B', value: '1) View List' },
			// 	{ name: '\u200B', value: 'Add to List' },
			// 	{ name: '\u200B', value: 'Remove from List' },
			// )
			// .addField('Inline field title', 'Some value here', true)
			// .setImage('https://i.imgur.com/wSTFkRM.png')
			// .setTimestamp()
			// .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
			message.channel.send(exampleEmbed);

			// return message.channel.send(
			// 	'Select an option by entering its number:\n' +
			// 	'1) View list of games\n' +
			// 	'2) Add a game\n' +
			// 	'3) Remove a game');
		}
		else if (args[0] === 'epic') {

			const { data } = await fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US').then(response => response.json());

			const currentDate = new Date();
			const freeEpicGames = data.Catalog.searchStore.elements.filter(game => {
				const gameDate = new Date(game.effectiveDate);
				return currentDate.valueOf() > gameDate.valueOf();
			});

			const messageEmbed = new Discord.MessageEmbed().setColor('FFFFFF')
				.attachFiles(['./icons/ps.png'])
				.setURL('https://discord.js.org/')
				.setAuthor('Free Epic Games', 'attachment://ps.png')
				.setDescription('TO-DO');

			message.channel.send(messageEmbed);
		}
	},
};

// Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >