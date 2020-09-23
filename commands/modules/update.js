const Discord = require('discord.js');
const db = require('./dbInterface');
const fetch = require('node-fetch');

module.exports = {

    async psUpdate(channel) {
        //Check PlayStation titles
        return db.check('ps').then(gamesToCheck => {

            gamesToCheck.forEach(async function (game) {

                //Grab price info
                const { included } = await fetch(process.env.psStoreURL + game.url.substring(44))
                    .then(response => {
                        console.log(response);
                        return response.json();
                    })
                    .catch(console.error);
                const contentInfo = included[0].attributes;
                const contentPrice = contentInfo.skus[0].prices;

                if (contentPrice['plus-user']['discount-percentage'] !== 0 || contentPrice['non-plus-user']['discount-percentage'] !== 0) {
                    // Discount available
                    if (game.onSale === false) {
                        // Calculate discount if title does not have onSale status
                        let discount;
                        if (contentPrice['plus-user']['discount-percentage'] > contentPrice['non-plus-user']['discount-percentage']) {
                            discount = contentPrice['plus-user'];
                        }
                        else {
                            discount = contentPrice['non-plus-user'];
                        }
                        const discountEndDate = new Date(discount.availability['end-date']);

                        // Create embed
                        const messageEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(contentInfo.name)
                            .setURL(game.url)
                            .setAuthor('PlayStation Deals', process.env.psIcon)
                            .setImage(contentInfo['thumbnail-url-base'])
                            .addField('Regular Price', '~~' + discount['strikethrough-price']['display'] + '~~', true)
                            .addField('Sale Price', discount['actual-price']['display'], true)
                            .addField('Discount', discount['discount-percentage'] + '%', true)
                            .setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                        channel.send(messageEmbed);
                        return db.updateOnSale('ps', game.url);
                    } else return;

                } else {
                    // No discount available
                    if (game.onSale === true) {
                        return db.updateOnSale('ps', game.url);
                    }
                    else return;
                }
            });
        });
    },
    async eshopUpdate(channel) {

        // Check Nintendo eShop titles
        return db.check('eshop').then(gamesToCheck => {

            gamesToCheck.forEach(async function (game) {

                const page = await fetch(game.url).then(response => response.text());

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
                const slug = game.url.substring(game.url.search('detail/') + 7);
                const imageURL = process.env.eshopImageURL + slug + slug.substring(0, slug.length - 1) + '-hero.jpg';

                // Grab prices and calculate discount
                const { prices } = await fetch(process.env.eshopURL + gameId).then(response => response.json());

                const regularPrice = Number.parseFloat(prices[0].regular_price.amount.substring(1));

                //Calculate discount if applicable
                let discountEndDate;
                let discountPrice;
                let discount = 0;

                if (prices[0].discount_price) {
                    discountEndDate = new Date(prices[0].discount_price.end_datetime);
                    discountPrice = Number.parseFloat(prices[0].discount_price.amount.substring(1));
                    discount = ((regularPrice - discountPrice) / regularPrice) * 100;
                }

                if (discount !== 0) {
                    // Discount available
                    if (game.onSale === false) {
                        // Create embed
                        const messageEmbed = new Discord.MessageEmbed()
                            .setColor('#E60012')
                            .setTitle(gameTitle)
                            .setURL(game.url)
                            .setAuthor('Nintendo eShop Deals', process.env.switchIcon)
                            .setImage(imageURL)
                            .addField('Regular Price', '~~$' + regularPrice + '~~', true)
                            .addField('Sale Price', '$' + discountPrice, true)
                            .addField('Discount', discount.toPrecision(2) + '%', true)
                            .setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
                        channel.send(messageEmbed);
                        return db.updateOnSale('eshop', game.url);
                    } else return;

                } else {
                    // No discount available
                    if (game.onSale === true) {
                        return db.updateOnSale('eshop', game.url);
                    } else return;
                }
            });
        });
    },
};
