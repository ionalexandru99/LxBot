const Discord = require('discord.js');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const db = require('./dbInterface');
require('dotenv').config();

const parser = new Parser({
    customFields: {
        item: ['media:thumbnail', 'image'],
    }
});

module.exports = {

    async check(channel) {
        //Grab latest Game Pass article from RSS feed
        let article = null;
        let i = 0;
        const rss = (await parser.parseURL(process.env.gamePassURL)).items;
        do {
            if (rss[i].title.startsWith('Coming Soon to Xbox Game Pass'))
                article = rss[i];
            else
                i++;
        } while (!article && i < rss.length)

        if (!article)
            return;

        db.getGamePass(article.link).then(articleSaved => {
            if (articleSaved !== article.link) {

                // Grab article image
                const imageURL = article['media:thumbnail']['$'].url;

                // Create embed
                const messageEmbed = new Discord.MessageEmbed()
                    .setTitle(article.title)
                    .setURL(article.link)
                    .setColor('#5dc21e')
                    .setImage(imageURL)
                    .setAuthor('Xbox Game Pass', process.env.xboxIcon)
                    .setDescription(article.contentSnippet);

                db.addGamePass(article.link);
                return channel.send(messageEmbed);
            }
        })
            .catch(console.error);
    },
};
