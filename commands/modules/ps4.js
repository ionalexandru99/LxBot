const Discord = require('discord.js');
const fetch = require('node-fetch');
const db = require('./dbInterface');

module.exports = {

	async check(message) {

		const messages = [];
		let games = [];

		const topMenuEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setDescription('Choose an action to take by typing a number to execute your requested action. Type **exit** to cancel.'
				+ '\n'
				+ '\n 1) View tracked games'
				+ '\n 2) Add a game'
				+ '\n 3) Remove a game')
			.setAuthor('PlayStation 4 Deals', 'https://blog.playstation.com/tachyon/2019/03/pslogo.png');

		function viewGamesEmbed(list) {
			return (
				new Discord.MessageEmbed(topMenuEmbed)
					.setDescription('Here is the list of currently tracked games:'
						+ '\n\n'
						+ list.map(game => '- ' + game).sort().join('\n'))
			);
		}

		const editGamesEmbed = new Discord.MessageEmbed(topMenuEmbed)
			.setDescription('Enter the URL for the game as found on the PlayStation Store'
				+ '\n\n Example: `https://store.playstation.com/en-us/product/UP0002-CUSA13795_00-CRASHTEAMRACING1`');

		async function getGameJSON(url) {
			const gameUrl = url;
			const { included } = await fetch('https://store.playstation.com/valkyrie-api/en/US/999/resolve/' + gameUrl.substring(43)).then(response => response.json());
			return included[0].attributes;
		}

		function deleteMessages() {
			messages.forEach(obj => obj.delete().catch(console.error));
		}
		const mainFilter = response => {
			return response.content === '1' || response.content === '2' || response.content === '3' || response.content == 'exit';
		};
		const editFilter = response => {
			return response.content.includes('https://store.playstation.com') || response.content == 'exit';
		};

		message.channel.send(topMenuEmbed).then((msg) => {
			messages.push(msg);
			message.channel.awaitMessages(mainFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					switch (`${collected.first()}`) {
						// View games
						case '1':
							db.listPS4().then(list => {
								messages.push(message.channel.lastMessage);
								deleteMessages();
								message.channel.send(viewGamesEmbed(list));
							});
							break;
						// Add games
						case '2':
							messages.push(message.channel.lastMessage);
							message.channel.send(editGamesEmbed).then((msg) => {
								messages.push(msg);
								message.channel.awaitMessages(editFilter, { max: 1, time: 15000, errors: ['time'] })
									.then(collected => {
										switch (`${collected.first()}`) {
											case 'exit':
												messages.push(message.channel.lastMessage);
												deleteMessages();
												message.channel.send('Menu closed.');
												break;
											default:
												// Need to check if url is already in the list
												// UnhandlePromiseRejectionWarning: SequelizeUniqueConstraintError
												getGameJSON(`${collected.first()}`).then(game => {
													db.addPS4(game.name, `${collected.first()}`);
													messages.push(message.channel.lastMessage);
													deleteMessages();
													message.channel.send(game.name + ' successfully added!');
													console.log(games);
												}
												);
										}
									})
									.catch(collected => {
										deleteMessages();
										message.channel.send('Menu has been closed due to inactivity.');
									})
							});
							break;
						// Remove games
						case '3':
							messages.push(message.channel.lastMessage);
							message.channel.send(editGamesEmbed).then((msg) => {
								messages.push(msg);
								message.channel.awaitMessages(editFilter, { max: 1, time: 15000, errors: ['time'] })
									.then(collected => {
										switch (`${collected.first()}`) {
											case 'exit':
												messages.push(message.channel.lastMessage);
												deleteMessages();
												message.channel.send('Menu closed.');
												break;
											default:
												// Need to check if url exists in list
												db.deletePS4(`${collected.first()}`).then((gameToDelete) => {
													messages.push(message.channel.lastMessage);
													deleteMessages();
													message.channel.send(gameToDelete + ' successfully removed!');
												});
										}
									})
									.catch(collected => {
										deleteMessages();
										message.channel.send('Menu has been closed due to inactivity.');
									})
							});
							break;
						case 'exit':
							messages.push(message.channel.lastMessage);
							deleteMessages();
							message.channel.send('Menu closed.');
							break;
						default:
							console.error;
					}
				})
				.catch(collected => {
					deleteMessages();
					message.channel.send('Menu has been closed due to inactivity.');
				});
		});

		const url = 'https://store.playstation.com/en-us/product/UP0002-CUSA13795_00-CRASHTEAMRACING1';
		const { included } = await fetch('https://store.playstation.com/valkyrie-api/en/US/999/resolve/' + url.substring(43)).then(response => response.json());
		const contentInfo = included[0].attributes;
		const contentPrice = contentInfo.skus[0].prices;

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
			.setURL(url)
			.setAuthor('PlayStation 4 Deals', 'https://blog.playstation.com/tachyon/2019/03/pslogo.png')
			.setImage(contentInfo['thumbnail-url-base'])
			.addField('Regular Price', '~~' + discount['strikethrough-price']['display'] + '~~', true)
			.addField('Sale Price', discount['actual-price']['display'], true)
			.addField('Discount', discount['discount-percentage'] + '%', true)
			.setFooter('Sale ends ' + discountEndDate.toLocaleString('en-US', { timezone: 'America/New_York' }));
		// message.channel.send(messageEmbed);
	},
};