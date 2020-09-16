const Discord = require('discord.js');
const fetch = require('node-fetch');
const db = require('./dbInterface');
const { switchIcon } = require(process.env);

module.exports = {

	menu(message) {

		const messages = [];

		// Embed skeleton
		const topMenuEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setDescription('Choose an action to take by typing a number to execute your requested action. Type **exit** to cancel.'
				+ '\n'
				+ '\n 1) View tracked games'
				+ '\n 2) Add a game'
				+ '\n 3) Remove a game')
			.setAuthor('Nintendo eShop Deals', switchIcon);

		//Embed for viewing list of tracked games
		function viewGamesEmbed(list) {
			if (list.length > 0) {
				return (
					new Discord.MessageEmbed(topMenuEmbed)
						.setDescription('Here is the list of currently tracked games:'
							+ '\n\n'
							+ list.map(game => ':white_small_square: [' + game.title + '](' + game.url + ')' + (game.onSale ? ' `ON SALE`' : '')).sort().join('\n'))
				);
			} else {
				return (
					new Discord.MessageEmbed(topMenuEmbed)
						.setDescription('There are currently no tracked games.')
				);
			}
		}

		// Embed for list editing
		const editGamesEmbed = new Discord.MessageEmbed(topMenuEmbed)
			.setDescription('Enter the URL for the game as found on the Nintendo eShop'
				+ '\n\n Example: `https://www.nintendo.com/games/detail/animal-crossing-new-horizons-switch/`');

		// Embed for successful list editing
		function editGamesSuccessEmbed(name, action) {
			if (action === 'add')
				return new Discord.MessageEmbed(topMenuEmbed).setDescription(name + ' successfully added! :white_check_mark:');
			else if (action === 'delete')
				return new Discord.MessageEmbed(topMenuEmbed).setDescription(name + ' successfully removed! :x:');
		}

		// Embed for unsuccessful list editing
		function editGamesFailureEmbed(action) {
			if (action === 'remove') {
				return new Discord.MessageEmbed(topMenuEmbed).setDescription('That game is not on the list! :facepalm:');
			} else if (action === 'add') {
				return new Discord.MessageEmbed(topMenuEmbed).setDescription('That game is already on the list! :facepalm:');
			}
		}

		// Embed for invalid URL
		function errorURLEmbed() {
			return (new Discord.MessageEmbed(topMenuEmbed)
				.setTitle(':warning: Invalid URL :warning:')
				.setDescription('Make sure that the URL you entered is from the correct site and that it is complete!')
			);
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

		// Delete message stack when done
		function deleteMessages() {
			messages.forEach(obj => obj.delete().catch(console.error));
		}

		// Filter for menu navigation
		const mainFilter = response => {
			return response.content === '1' || response.content === '2' || response.content === '3' || response.content == 'exit';
		};
		// Filter for list editing
		const editFilter = response => {
			return response.content.includes('https://www.nintendo.com/games/detail/') || response.content == 'exit';
		};

		return message.channel.send(topMenuEmbed).then(async (msg) => {
			messages.push(msg);
			await message.channel.awaitMessages(mainFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					switch (`${collected.first()}`) {
						// View list of tracked titles
						case '1':
							db.listEShop().then(list => {
								messages.push(message.channel.lastMessage);
								deleteMessages();
								return message.channel.send(viewGamesEmbed(list));
							});
							break;
						// Add a title to be tracked
						case '2':
							messages.push(message.channel.lastMessage);
							message.channel.send(editGamesEmbed).then((msg) => {
								messages.push(msg);
								return message.channel.awaitMessages(editFilter, { max: 1, time: 15000, errors: ['time'] })
									.then(collected => {
										switch (`${collected.first()}`) {
											// Exit menu
											case 'exit':
												messages.push(message.channel.lastMessage);
												deleteMessages();
												return message.channel.send('Menu closed.');
											default:
												getGameTitle(`${collected.first()}`).then(game => {
													//Check if URL is valid
													if (game === '') {
														messages.push(message.channel.lastMessage);
														deleteMessages();
														return message.channel.send(errorURLEmbed());
													} else {
														db.addEShop(game, `${collected.first()}`).then(name => {
															messages.push(message.channel.lastMessage);
															deleteMessages();
															// Check if title is already on the tracked list
															if (name !== '') {
																return message.channel.send(editGamesSuccessEmbed(name, 'add'));
															} else {
																return message.channel.send(editGamesFailureEmbed('add'));
															}
														});
													}
												}
												).catch(() => {
													messages.push(message.channel.lastMessage);
													deleteMessages();
													return message.channel.send(errorURLEmbed());
												});
										}
									})
									.catch(collected => {
										deleteMessages();
										return message.channel.send('Menu has been closed due to inactivity.');
									})
							});
							break;
						// Remove a title from being tracked
						case '3':
							messages.push(message.channel.lastMessage);
							message.channel.send(editGamesEmbed).then((msg) => {
								messages.push(msg);
								message.channel.awaitMessages(editFilter, { max: 1, time: 15000, errors: ['time'] })
									.then(collected => {
										switch (`${collected.first()}`) {
											// Exit menu
											case 'exit':
												messages.push(message.channel.lastMessage);
												deleteMessages();
												return message.channel.send('Menu closed.');
											default:
												db.deleteEShop(`${collected.first()}`).then((game) => {
													messages.push(message.channel.lastMessage);
													deleteMessages();
													// Check if the title is on the tracked list
													if (game !== '') {
														return message.channel.send(editGamesSuccessEmbed(game, 'delete'));
													} else {
														return message.channel.send(editGamesFailureEmbed('remove'));
													}
												});
										}
									})
									.catch(collected => {
										deleteMessages();
										return message.channel.send('Menu has been closed due to inactivity.');
									})
							});
							break;
						// Exit menu
						case 'exit':
							messages.push(message.channel.lastMessage);
							deleteMessages();
							return message.channel.send('Menu closed.');
						default:
							return console.error;
					}
				})
				.catch(collected => {
					deleteMessages();
					return message.channel.send('Menu has been closed due to inactivity.');
				});
		});
	},
};
