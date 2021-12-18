const Discord = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {

	async check(channel) {

		// Grab list of free weekly games from Epic
		const { data } = await fetch(process.env.epicFreeURL).then(response => response.json());

		// Remove games not yet available for free
		const freeEpicGames = data.Catalog.searchStore.elements.filter(game => {
			if (game.promotions !== null)
				if (game.promotions.promotionalOffers.length > 0)
					return (game.promotions.promotionalOffers[0].promotionalOffers[0].discountSetting.discountPercentage == 0) ? true : false;
		});

		freeEpicGames.map(async game => {

			// Grab game information
			let gameURL = process.env.epicStoreURL;
			if (game.productSlug.substring(game.productSlug.length - 5) === "/home")
				gameURL += game.productSlug.substring(0, game.productSlug.length - 5);
			else
				gameURL += game.productSlug;

			//Parse productSlug for game editions/DLC
			if (gameURL.includes('--')) {
				const urlItems = gameURL.split('--');
				gameURL = urlItems[0];
			}

			//Obtain selective content from game JSON
			const { pages } = await fetch(gameURL).then(response => response.json());
			const gamePage = pages.find(content => {
				return content._title === 'home';
			});

			//Assign developer and publisher when possible
			let developer = gamePage.data.meta.developer ? gamePage.data.meta.developer : '-';
			let publisher = gamePage.data.meta.publisher ? gamePage.data.meta.publisher : '-';

			for (attr = 0; attr < game.customAttributes.length; attr++) {
				if (game.customAttributes[attr].key == 'developerName')
					developer = game.customAttributes[attr].value;
				if (game.customAttributes[attr].key == 'publisherName')
					publisher = game.customAttributes[attr].value;
			}

			// Convert category tags to title case
			let tags = ['N/A'];
			try {
				tags = gamePage.data.meta.tags.map(tag => {
					tag = tag.toLowerCase();
					const words = tag.split('_').map(word => {
						return word.substring(0, 1).toUpperCase() + word.substring(1);
					});
					return words.join(' ');
				});
			} catch (error) {
				console.log('No tags found for ' + game.title);
			}

			// Determine the end date for the promotion
			const endDate = new Date(game.promotions.promotionalOffers[0].promotionalOffers[0].endDate);

			// Create embed
			const messageEmbed = new Discord.MessageEmbed()
				.setTitle(game.title)
				.setURL(process.env.epicGameURL + game.productSlug)
				.setColor('#FDFDFD')
				.setThumbnail()
				.setAuthor('Epic Games Store', process.env.epicIcon)
				.setDescription(
					gamePage.data.about.shortDescription ? gamePage.data.about.shortDescription : '')
				.setImage(encodeURI(game.keyImages[0].url))
				.addField('Developer', developer, true)
				.addField('Publisher', publisher, true)
				.addField('Tags', tags.join(', '), true)
				.setFooter('Free until ' + endDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));

			return channel.send(messageEmbed);
		});
	},
};
