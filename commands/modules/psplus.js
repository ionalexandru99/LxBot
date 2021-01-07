const Discord = require('discord.js');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const db = require('./dbInterface');

const parser = new Parser();

module.exports = {

	async check(channel) {
		//Grab latest article from RSS feed
		const article = (await parser.parseURL(process.env.psPlusURL)).items[0];
		const source = await fetch(article.link).then(response => response.text());

		db.getPsPlus(article.link).then(articleSaved => {
			if (articleSaved !== article.link) {

				// Grab article image
				const imageStart = source.search('<div class="post-single__featured-asset">');
				let imageURL = source.substring(imageStart + 79);
				const imageEnd = imageURL.search('"');
				imageURL = imageURL.substring(0, imageEnd);

				// Create embed
				const messageEmbed = new Discord.MessageEmbed()
					.setTitle(article.title)
					.setURL(article.link)
					.setColor('#0099ff')
					.setImage(imageURL)
					.setAuthor('PlayStation Plus', process.env.psPlusIcon)
					.setDescription(article.contentSnippet);

				db.addPsPlus(article.link);
				return channel.send(messageEmbed);
			}
		})
			.catch(console.error);
	},
};
