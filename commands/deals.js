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

			// Grab list of free weekly games from Epic
			const { data } = await fetch('https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US').then(response => response.json());

			// Remove games not yet available for free
			const currentDate = new Date();
			const freeEpicGames = data.Catalog.searchStore.elements.filter(game => {
				const gameDate = new Date(game.effectiveDate);
				return currentDate.valueOf() > gameDate.valueOf();
			});

			freeEpicGames.map(async game => {

				// Grab game information
				const gameURL = 'https://store-content.ak.epicgames.com/api/en-US/content/products/' + game.productSlug.substring(0, game.productSlug.length - 5);
				const { pages } = await fetch(gameURL).then(response => response.json());
				const gamePage = pages.find(content => {
					return content.productName === game.title;
				});

				// Convert category tags to title case
				const tags = gamePage.data.meta.tags.map(tag => {
					tag = tag.toLowerCase();
					const words = tag.split('_').map(word => {
						return word.substring(0, 1).toUpperCase() + word.substring(1);
					});
					return words.join(' ');
				});

				// Determine the end date for the promotion
				const endDate = new Date(game.effectiveDate);
				endDate.setDate(endDate.getDate() + 7);

				// Create embed
				const messageEmbed = new Discord.MessageEmbed()
					.setTitle(game.title)
					.setURL('https://www.epicgames.com/store/en-US/product/' + game.productSlug)
					.setColor('FFFFFF')
					.setThumbnail()
					.setAuthor('Epic Games Store', 'https://pbs.twimg.com/profile_images/1273739401387036676/y3-FozWF.jpg')
					.setDescription(gamePage.data.about.shortDescription)
					.setImage(game.keyImages[0].url)
					.addField('Developer', gamePage.data.meta.developer, true)
					.addField('Publisher', gamePage.data.meta.publisher, true)
					.addField('Tags', tags.join(', '), true)
					.setFooter('Free until ' + endDate.toLocaleString('en-US', { timezone: 'America/New_York' }));

				message.channel.send(messageEmbed);
			});
		}
	},
};

// Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >