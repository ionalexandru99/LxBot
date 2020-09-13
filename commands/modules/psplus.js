const Discord = require('discord.js');
const fetch = require('node-fetch');
const Parser = require('rss-parser');

const parser = new Parser();

module.exports = {

	async check(message) {

		const article = (await parser.parseURL('https://blog.us.playstation.com/category/ps-plus/feed/')).items[0];
		const source = await fetch(article.link).then(response => response.text());

		// Grab article image
		const imageStart = source.search('<div class="post-single__featured-asset">');
		let imageURL = source.substring(imageStart + 79);
		const imageEnd = imageURL.search('"');
		imageURL = imageURL.substring(0, imageEnd);

		const messageEmbed = new Discord.MessageEmbed()
			.setTitle(article.title)
			.setURL(article.link)
			.setColor('#0099ff')
			.setImage(imageURL)
			.setAuthor('PlayStation Plus', 'https://b.thumbs.redditmedia.com/3r51LlAuUH2WHeY1QicMEXc43DRS4FwWXM4oryRracQ.png')
			.setDescription(article.contentSnippet);

		message.channel.send(messageEmbed);
	},
};
