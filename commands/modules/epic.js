const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {

	async check(channel) {

		// Grab list of free weekly games from Epic
		const { data } = await fetch(process.env.epicFreeURL).then(response => response.json());

		// Remove games not yet available for free
		const currentDate = new Date();
		const freeEpicGames = data.Catalog.searchStore.elements.filter(game => {
			const gameDate = new Date(game.effectiveDate);
			return currentDate.valueOf() > gameDate.valueOf();
		});

		freeEpicGames.map(async game => {

			// Grab game information
			const gameURL = process.env.epicStoreURL + game.productSlug.substring(0, game.productSlug.length - 5);
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
				.setURL(process.env.epicGameURL + game.productSlug)
				.setColor('#FDFDFD')
				.setThumbnail()
				.setAuthor('Epic Games Store', process.env.epicIcon)
				.setDescription(gamePage.data.about.shortDescription)
				.setImage(game.keyImages[0].url)
				.addField('Developer', gamePage.data.meta.developer, true)
				.addField('Publisher', gamePage.data.meta.publisher, true)
				.addField('Tags', tags.join(', '), true)
				.setFooter('Free until ' + endDate.toLocaleString('en-US', { timezone: 'America/New_York' }));

			channel.send(messageEmbed);
		});
	},
};
