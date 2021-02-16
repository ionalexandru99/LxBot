const Discord = require('discord.js');
const fetch = require('node-fetch');
const { epicFreeURL, epicGameURL, epicIcon } = require('../../config.json');

const storefrontURL = process.env.epicFreeURL || epicFreeURL;
const gamePageURL = process.env.epicGameURL || epicGameURL;
const storefrontIcon = process.env.epicIcon || epicIcon;

module.exports = {

	async check(channel) {

		// Grab list of free weekly games from Epic
		const { data } = await fetch(storefrontURL).then(response => response.json());

		// Remove games not yet available for free
		const currentDate = new Date();
		const freeEpicGames = data.Catalog.searchStore.elements.filter(game => {
			if (game.promotions)
				return (game.promotions.promotionalOffers.length > 0) ? true : false;
		});

		freeEpicGames.map(async game => {

			// Grab game information
			let gameURL = epicStoreURL;
			if (game.productSlug.substring(game.productSlug.length - 5) === "/home")
				gameURL += game.productSlug.substring(0, game.productSlug.length - 5);
			else
				gameURL += game.productSlug;

			const { pages } = await fetch(gameURL).then(response => response.json());
			const gamePage = pages.find(content => {
				return content._title === 'home';
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
			const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);

			// Create embed
			const messageEmbed = new Discord.MessageEmbed()
				.setTitle(game.title)
				.setURL(gamePageURL + game.productSlug)
				.setColor('#FDFDFD')
				.setThumbnail()
				.setAuthor('Epic Games Store', storefrontIcon)
				.setDescription(
					gamePage.data.about.shortDescription ? gamePage.data.about.shortDescription : '')
				.setImage(game.keyImages[0].url)
				.addField('Developer', gamePage.data.meta.developer, true)
				.addField('Publisher', gamePage.data.meta.publisher, true)
				.addField('Tags', tags.join(', '), true)
				.setFooter('Free until ' + endDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));

			channel.send(messageEmbed);
		});
	},
};
