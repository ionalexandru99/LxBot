const Discord = require('discord.js');
const fetch = require('node-fetch');

module.exports = {

	async check(message) {

		const storeUrl = 'https://www.nintendo.com/games/detail/sword-art-online-fatal-bullet-complete-edition-switch/';
		const page = await fetch(storeUrl).then(response => response.text());

		// Grab game ID
		const gameIdStart = page.search('platform-label nsuid="');
		let gameId = page.substring(gameIdStart + 22);
		const gameIdEnd = gameId.search('"');
		gameId = gameId.substring(0, gameIdEnd);

		// Grab game title
		const gameTitleStart = page.search('game-title">');
		let gameTitle = page.substring(gameTitleStart + 12);
		const gameTitleEnd = gameTitle.search('</h1>');
		gameTitle = gameTitle.substring(0, gameTitleEnd);

		// Grab game image
		const slug = storeUrl.substring(storeUrl.search('detail/') + 7);
		const imageURL = 'https://www.nintendo.com/content/dam/noa/en_US/games/switch/s/' + slug + slug.substring(0, slug.length - 1) + '-hero.jpg';

		// Grab prices and calculate discount
		const { prices } = await fetch('https://api.ec.nintendo.com/v1/price?country=US&lang=en&ids=' + gameId).then(response => response.json());

		const discountEndDate = new Date(prices[0].discount_price.end_datetime);
		const regularPrice = Number.parseFloat(prices[0].regular_price.amount.substring(1));
		const discountPrice = Number.parseFloat(prices[0].discount_price.amount.substring(1));
		const discount = ((regularPrice - discountPrice) / regularPrice) * 100;

		const messageEmbed = new Discord.MessageEmbed()
			.setColor('#E60012')
			.setTitle(gameTitle)
			.setURL(storeUrl)
			.setAuthor('Nintendo Switch Deals', 'https://b.thumbs.redditmedia.com/-jmGJ20JxItsO6OwSfcZ_gIAOh-INXRxnU2ZcNS899s.png')
			.setImage(imageURL)
			.addField('Regular Price', '~~$' + regularPrice + '~~', true)
			.addField('Sale Price', '$' + discountPrice, true)
			.addField('Discount', discount.toPrecision(2) + '%', true)
			// .setDescription('**Select an option by entering its number:**' +
			// 	'\n1) View List' +
			// 	'\n2) Add to List' +
			// 	'\n3) Remove from List');
			.setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timezone: 'America/New_York' }));
		message.channel.send(messageEmbed);
	},
};