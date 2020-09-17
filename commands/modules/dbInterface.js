const { Sequelize, where } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    port: process.env.PORT,
    dialect: 'postgres'
});

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
const Module = sequelize.define('module', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    enabled: Sequelize.BOOLEAN,
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
        await Module.findOrCreate(
            {
                where: {
                    name: "epic",
                },
                defaults: {
                    name: "epic",
                    enabled: false,
                }
            },
        );
        await Module.findOrCreate(
            {
                where: {
                    name: "psplus",
                },
                defaults: {
                    name: "psplus",
                    enabled: false,
                }
            },
        );
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
    },
    // Delete channel ID
    async deleteChannel() {
        const savedChannel = await Channel.findOne();
        if (savedChannel) {
            const name = savedChannel.getDataValue('name');
            await savedChannel.destroy();
            return name;
        } else {
            return savedChannel;
        }
    },

    // Check status of a module
    async checkModule(moduleName) {
        return await Module.findOne({ where: { 'name': moduleName } }).then(module => {
            if (module) {
                return module.getDataValue('enabled');
            } else {
                return null;
            }
        });
    },
    // Enable or disable a module
    async manageModule(moduleName) {
        return await Module.findOne({ where: { 'name': moduleName } }).then(module => {
            if (module) {
                module.setDataValue('enabled', !(module.getDataValue('enabled')));
                module.save().catch(console.error);
                return module.getDataValue('enabled');
            } else {
                return null;
            }
        }
        );
    },

    // Get saved PS Plus article
    async getPsPlus() {
        const savedArticle = await PSPlus.findOne().catch(console.error);
        if (savedArticle) {
            return savedArticle.getDataValue('url');
        } else {
            return '';
        }
    },
    // Update saved PS Plus article
    async updatePsPlus(url) {
        const article = await PSPlus.findOne({ where: { url: url } }).catch(console.error);
        if (article) {
            article.setDataValue('url', url);
            article.save().catch(console.error);
        } else {
            PSPlus.create({
                url: url,
            }).catch(console.error);
        }
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
