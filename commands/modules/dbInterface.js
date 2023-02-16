const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        port: process.env.PORT,
        dialect: process.env.dbDialect,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
    });
else
    sequelize = new Sequelize({
        dialect: process.env.dbDialect,
        storage: './database.sqlite'
      });
    
    // new Sequelize(process.env.dbName, process.env.dbUser, process.env.dbPass, {
    //     dialect: 
    // });

// Model definitions
const Channel = sequelize.define('channel', {
    channelID: {
        type: Sequelize.BIGINT,
        unique: true,
    },
    name: Sequelize.STRING,
}, {
    freezeTableName: true,
});
const PSGame = sequelize.define('psgames', {
    title: {
        type: Sequelize.STRING,
        unique: true,
    },
    url: Sequelize.STRING,
    onSale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
}, {
    freezeTableName: true,
});
const EShopGame = sequelize.define('eshopgames', {
    title: {
        type: Sequelize.STRING,
        unique: true,
    },
    url: Sequelize.STRING,
    onSale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
}, {
    freezeTableName: true,
});
const PSPlus = sequelize.define('psplus', {
    url: {
        type: Sequelize.STRING,
        unique: true,
    },
}, {
    freezeTableName: true,
});
const GamePass = sequelize.define('gamepass', {
    url: {
        type: Sequelize.STRING,
        unique: true,
    },
}, {
    freezeTableName: true,
});

module.exports = {

    // Test database connection
    async testDB() {
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    },
    // Set up database with initial tables
    async setUpDB() {
        await sequelize.sync();
    },

    // Get saved channel ID
    async getChannel() {
        const channel = await Channel.findOne();
        if (channel) {
            return channel.getDataValue('channelID');
        } else {
            return 0;
        }
    },
    // Add channel ID
    async addChannel(channel) {
        try {
            const savedChannel = await Channel.findOne();
            if (!savedChannel) {
                Channel.create({
                    channelID: channel.id,
                    name: channel.name,
                });
                return 'none';
            } else {
                return savedChannel.getDataValue('name');;
            }
        } catch (error) {
            console.log(error);
        }

    },
    // Delete channel ID
    async deleteChannel() {
        try {
            const savedChannel = await Channel.findOne();
            if (savedChannel) {
                const name = savedChannel.getDataValue('name');
                await savedChannel.destroy();
                return name;
            } else {
                return savedChannel;
            }
        } catch (error) {
            console.log(error);
        }

    },

    // Get saved PS Plus article
    async getPsPlus(url) {
        const savedArticle = await PSPlus.findOne({ where: { url: url } }).catch(console.error);
        if (savedArticle) {
            return savedArticle.getDataValue('url');
        } else {
            return '';
        }
    },
    // Save PS Plus article
    async addPsPlus(url) {
        PSPlus.create({
            url: url,
        }).catch(console.error);
    },

    // List all tracked PlayStation title
    async listPS() {
        const data = await PSGame.findAll();
        const list = [];
        data.forEach(entry => {
            list.push(entry);
        });
        return list;
    },
    // Add a PlayStation title to track
    async addPS(gameTitle, gameUrl) {
        const game = await PSGame.findOne({ where: { url: gameUrl } });
        if (game) {
            return '';
        } else {
            PSGame.create({
                title: gameTitle,
                url: gameUrl
            });
            return gameTitle;
        }
    },
    // Delete a tracked PlayStation title
    async deletePS(url) {
        const game = await PSGame.findOne({ where: { url: url } });
        if (game) {
            const title = game.getDataValue('title');
            await game.destroy();
            return title;
        } else {
            return '';
        }
    },

    // List all tracked Nintendo eShop titles
    async listEShop() {
        const data = await EShopGame.findAll();
        const list = [];
        data.forEach(entry => {
            list.push(entry);
        });
        return list;
    },
    // Add a Nintendo eShop title to track
    async addEShop(gameTitle, gameUrl) {
        const game = await EShopGame.findOne({ where: { url: gameUrl } });
        if (game) {
            return '';
        } else {
            EShopGame.create({
                title: gameTitle,
                url: gameUrl
            });
            return gameTitle;
        }
    },
    // Delete a tracked Nintendo eShop title
    async deleteEShop(url) {
        const game = await EShopGame.findOne({ where: { url: url } });
        if (game) {
            const title = game.getDataValue('title');
            await game.destroy();
            return title;
        } else {
            return '';
        }
    },

    // Get saved Game Pass article
    async getGamePass(url) {
        const savedArticle = await GamePass.findOne({ where: { url: url } }).catch(console.error);
        if (savedArticle) {
            return savedArticle.getDataValue('url');
        } else {
            return '';
        }
    },
    // Save Game Pass article
    async addGamePass(url) {
        GamePass.create({
            url: url,
        }).catch(console.error);
    },

    // Grab list of tracked titles to check
    async check(platform) {
        let games;
        if (platform === 'ps') {
            games = await PSGame.findAll();
        } else if (platform === 'eshop') {
            games = await EShopGame.findAll();
        }
        else {
            console.error;
        }
        return (games.map(game => ({
            url: game.getDataValue('url'),
            onSale: game.getDataValue('onSale'),
        })
        )
        );
    },
    // Update a title's onSale status
    async updateOnSale(platform, url) {
        let game;
        if (platform === 'ps') {
            game = await PSGame.findOne({ where: { url: url } });
        } else if (platform === 'eshop') {
            game = await EShopGame.findOne({ where: { url: url } });
        }
        else {
            console.error;
        }
        game.setDataValue('onSale', !(game.getDataValue('onSale')));
        game.save().catch(console.error);
    }
};
