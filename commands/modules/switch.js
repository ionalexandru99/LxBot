const Discord = require('discord.js');
const fetch = require('node-fetch');
const db = require('./dbInterface');
const { switchIcon } = require('../../config.json');

module.exports = {

	async check(message) {

		const messages = [];

		const topMenuEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setDescription('Choose an action to take by typing a number to execute your requested action. Type **exit** to cancel.'
				+ '\n'
				+ '\n 1) View tracked games'
				+ '\n 2) Add a game'
				+ '\n 3) Remove a game')
			.setAuthor('Nintendo Switch Deals', switchIcon);

		function viewGamesEmbed(list) {
			if (list.length > 0) {
				return (
					new Discord.MessageEmbed(topMenuEmbed)
						.setDescription('Here is the list of currently tracked games:'
							+ '\n\n'
							+ list.map(game => '- ' + game).sort().join('\n'))
				);
			} else {
				return (
					new Discord.MessageEmbed(topMenuEmbed)
						.setDescription('There are currently no tracked games.')
				);
			}
		}

		const editGamesEmbed = new Discord.MessageEmbed(topMenuEmbed)
			.setDescription('Enter the URL for the game as found on the Nintendo eShop'
				+ '\n\n Example: `https://www.nintendo.com/games/detail/animal-crossing-new-horizons-switch/`');

		function editGamesSuccessEmbed(name, action) {
			if (action === 'add')
				return new Discord.MessageEmbed(topMenuEmbed).setDescription(name + ' successfully added!');
			else if (action === 'delete')
				return new Discord.MessageEmbed(topMenuEmbed).setDescription(name + ' successfully removed!');
		}

		function editGamesFailureEmbed(action) {
			if (action === 'remove') {
				return new Discord.MessageEmbed(topMenuEmbed).setDescription('That game is not on the list!');
			} else if (action === 'add') {
				return new Discord.MessageEmbed(topMenuEmbed).setDescription('That game is already on the list!');
			}
		}

		async function getGameTitle(url) {

			const page = await fetch(url).then(response => response.text());

			// Grab game ID
			const gameIdStart = page.search('platform-label nsuid="');
			let gameId = page.substring(gameIdStart + 22);
			const gameIdEnd = gameId.search('"');
			gameId = gameId.substring(0, gameIdEnd);

			// Grab game title
			const gameTitleStart = page.search('game-title">');
			let gameTitle = page.substring(gameTitleStart + 12);
			const gameTitleEnd = gameTitle.search('</h1>');
			return gameTitle.substring(0, gameTitleEnd);
		}

		function deleteMessages() {
			messages.forEach(obj => obj.delete().catch(console.error));
		}
		const mainFilter = response => {
			return response.content === '1' || response.content === '2' || response.content === '3' || response.content == 'exit';
		};
		const editFilter = response => {
			return response.content.includes('https://www.nintendo.com/games/detail/') || response.content == 'exit';
		};

		message.channel.send(topMenuEmbed).then((msg) => {
			messages.push(msg);
			message.channel.awaitMessages(mainFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					switch (`${collected.first()}`) {
						// View games
						case '1':
							db.listSwitch().then(list => {
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
												getGameTitle(`${collected.first()}`).then(game => {
													db.addSwitch(game, `${collected.first()}`).then(name => {
														messages.push(message.channel.lastMessage);
														deleteMessages();
														if (name !== '') {
															message.channel.send(editGamesSuccessEmbed(name, 'add'));
														} else {
															message.channel.send(editGamesFailureEmbed('add'));
														}
													});
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
												db.deleteSwitch(`${collected.first()}`).then((game) => {
													messages.push(message.channel.lastMessage);
													deleteMessages();
													if (game !== '') {
														message.channel.send(editGamesSuccessEmbed(game, 'delete'));
													} else {
														message.channel.send(editGamesFailureEmbed('remove'));
													}
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
	},
};