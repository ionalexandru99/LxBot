const Discord = require('discord.js');
const db = require('./dbInterface');
const fetch = require('node-fetch');
const { psIcon, psStoreURL, switchIcon, eshopURL, eshopImageURL } = require('../../config.json');

module.exports = {

    async psUpdate(channel) {
        console.log('Checking for sale updates for tracked PS titles...');

        db.check('ps4').then(gamesToCheck => {

            gamesToCheck.forEach(async function (game) {

                const { included } = await fetch(psStoreURL + game.url.substring(43)).then(response => response.json());
                const contentInfo = included[0].attributes;
                const contentPrice = contentInfo.skus[0].prices;

                if (contentPrice['plus-user']['discount-percentage'] !== 0 || contentPrice['non-plus-user']['discount-percentage'] !== 0) {
                    // Discount available
                    if (game.onSale === false) {
                        let discount;
                        if (contentPrice['plus-user']['discount-percentage'] > contentPrice['non-plus-user']['discount-percentage']) {
                            discount = contentPrice['plus-user'];
                        }
                        else {
                            discount = contentPrice['non-plus-user'];
                        }
                        const discountEndDate = new Date(discount.availability['end-date']);

                        const messageEmbed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(contentInfo.name)
                            .setURL(game.url)
                            .setAuthor('PlayStation 4 Deals', psIcon)
                            .setImage(contentInfo['thumbnail-url-base'])
                            .addField('Regular Price', '~~' + discount['strikethrough-price']['display'] + '~~', true)
                            .addField('Sale Price', discount['actual-price']['display'], true)
                            .addField('Discount', discount['discount-percentage'] + '%', true)
                            .setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timezone: 'America/New_York' }));
                        channel.send(messageEmbed);
                        db.updateOnSale('ps4', game.url);
                    }

                } else {
                    // No discount
                    if (game.onSale === true) {
                        db.updateOnSale('ps4', game.url);
                    }
                }
            });
        });
        console.log('PS update complete!');
    },
    async eshopUpdate(channel) {

        db.check('switch').then(gamesToCheck => {

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
                const imageURL = eshopImageURL + slug + slug.substring(0, slug.length - 1) + '-hero.jpg';

                // Grab prices and calculate discount
                const { prices } = await fetch(eshopURL + gameId).then(response => response.json());

                const regularPrice = Number.parseFloat(prices[0].regular_price.amount.substring(1));
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
                        const messageEmbed = new Discord.MessageEmbed()
                            .setColor('#E60012')
                            .setTitle(gameTitle)
                            .setURL(game.url)
                            .setAuthor('Nintendo Switch Deals', switchIcon)
                            .setImage(imageURL)
                            .addField('Regular Price', '~~$' + regularPrice + '~~', true)
                            .addField('Sale Price', '$' + discountPrice, true)
                            .addField('Discount', discount.toPrecision(2) + '%', true)
                            .setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timezone: 'America/New_York' }));
                        channel.send(messageEmbed);
                        db.updateOnSale('switch', game.url);
                    }

                } else {
                    // No discount
                    if (game.onSale === true) {
                        db.updateOnSale('switch', game.url);
                    }
                }
            });
        });
    },
};