const Discord = require('discord.js');
const db = require('./dbInterface');
const fetch = require('node-fetch');
const { psIcon, psStoreURL } = require('../../config.json');

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
                    // case 'switch':
                    //     const { included } = await fetch(psStoreURL + game.url.substring(43)).then(response => response.json());
                    //     const contentInfo = included[0].attributes;
                    //     const contentPrice = contentInfo.skus[0].prices;

                    //     if (contentPrice['plus-user']['discount-percentage'] !== 0 || contentPrice['non-plus-user']['discount-percentage'] !== 0) {
                    //         // Discount available
                    //         if (game.onSale === false) {
                    //             let discount;
                    //             if (contentPrice['plus-user']['discount-percentage'] > contentPrice['non-plus-user']['discount-percentage']) {
                    //                 discount = contentPrice['plus-user'];
                    //             }
                    //             else {
                    //                 discount = contentPrice['non-plus-user'];
                    //             }
                    //             const discountEndDate = new Date(discount.availability['end-date']);

                    //             const messageEmbed = new Discord.MessageEmbed()
                    //                 .setColor('#0099ff')
                    //                 .setTitle(contentInfo.name)
                    //                 .setURL(game.url)
                    //                 .setAuthor('PlayStation 4 Deals', psIcon)
                    //                 .setImage(contentInfo['thumbnail-url-base'])
                    //                 .addField('Regular Price', '~~' + discount['strikethrough-price']['display'] + '~~', true)
                    //                 .addField('Sale Price', discount['actual-price']['display'], true)
                    //                 .addField('Discount', discount['discount-percentage'] + '%', true)
                    //                 .setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timezone: 'America/New_York' }));
                    //             channel.send(messageEmbed);
                    //             db.updateOnSale(game.url);
                    //         }

                    //     } else {
                    //         // No discount
                    //         if (game.onSale === true) {
                    //             db.updateOnSale(game.url);
                    //         }
                    //     }
                }
            });
        });
    },
};