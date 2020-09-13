const psplus = require('./modules/psplus');
const epic = require('./modules/epic');
const ps = require('./modules/ps4');
const nintendo = require('./modules/switch');
const db = require('./modules/dbInterface');

module.exports = {
	name: 'deals',
	description: 'Deals for games',
	args: true,
	// usage: '<user> <role>',
	guildOnly: true,
	cooldown: 5,
	// aliases: ['icon', 'pfp'],
	async execute(message, args) {
		if (args[0] === 'ps4') {
			ps.check(message);
		}
		else if (args[0] === 'ps+' || args[0] === 'psplus') {
			// Grab RSS feed from PlayStationBlog
			psplus.check(message);
		}
		else if (args[0] === 'switch') {
			nintendo.check(message);
		}
		else if (args[0] === 'epic') {
			epic.check(message);
		}
		else if (args[0] === 'db') {
			db.testDB(message);
		}
	},
};

// Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >