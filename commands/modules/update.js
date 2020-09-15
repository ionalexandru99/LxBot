const Discord = require('discord.js');
const db = require('./dbInterface');
const fetch = require('node-fetch');
const { psIcon, psStoreURL, switchIcon, eshopURL, eshopImageURL } = require('../../config.json');

module.exports = {

    async update(channel, platform) {

        db.check(platform).then(gamesToCheck => {

            gamesToCheck.forEach(async function (game) {

                switch (platform) {
                    case 'ps4':
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
                                db.updateOnSale(platform, game.url);
                            }

                        } else {
                            // No discount
                            if (game.onSale === true) {
                                db.updateOnSale(platform, game.url);
                            }
                        }
                    case 'switch':
                        const page = await fetch(url).then(response => response.text());

                        // Grab game ID
                        const gameIdStart = page.search('platform-label nsuid="');
                        let gameId = page.substring(gameIdStart + 22);
                        const gameIdEnd = gameId.search('"');
                        gameId = gameId.substring(0, gameIdEnd);
                        console.log(gameID);

                        // Grab game title
                        const gameTitleStart = page.search('game-title">');
                        let gameTitle = page.substring(gameTitleStart + 12);
                        const gameTitleEnd = gameTitle.search('</h1>');
                        gameTitle = gameTitle.substring(0, gameTitleEnd);
                        console.log(gameTitle);

                        // Grab game image
                        const slug = storeUrl.substring(storeUrl.search('detail/') + 7);
                        const imageURL = eshopImageURL + slug + slug.substring(0, slug.length - 1) + '-hero.jpg';
                        console.log(imageURL);

                        // Grab prices and calculate discount
                        const { prices } = await fetch(eshopURL + gameId).then(response => response.json());

                        const discountEndDate = new Date(prices[0].discount_price.end_datetime);
                        const regularPrice = Number.parseFloat(prices[0].regular_price.amount.substring(1));
                        const discountPrice = Number.parseFloat(prices[0].discount_price.amount.substring(1));
                        const discount = ((regularPrice - discountPrice) / regularPrice) * 100;
                        console.log(discount);

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
                                db.updateOnSale(game.url);
                            }

                        } else {
                            // No discount
                            if (game.onSale === true) {
                                db.updateOnSale(game.url);
                            }
                        }
                }
            });
        });
    },
};