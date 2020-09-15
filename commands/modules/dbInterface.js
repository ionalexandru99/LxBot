const { Sequelize, where } = require('sequelize');
const { dbName, dbUser, dbPass } = require('../../config.json');

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'postgres'
});

const Channel = sequelize.define('channel', {
    channelID: {
        type: Sequelize.BIGINT,
        unique: true,
    },
    name: Sequelize.STRING,
});

const Module = sequelize.define('module', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    enabled: Sequelize.BOOLEAN,
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
});
const SwitchGame = sequelize.define('switchgames', {
    title: {
        type: Sequelize.STRING,
        unique: true,
    },
    url: Sequelize.STRING,
    onSale: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
});

const PSPlus = sequelize.define('psplus', {
    url: {
        type: Sequelize.STRING,
        unique: true,
    },
});

module.exports = {

    async testDB() {
        try {
            await sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    },
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
    async checkChannel() {
        const channel = await Channel.findOne();
        if (channel) {
            return channel.getDataValue('channelID');
        } else {
            return 0;
        }
    },
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
    async checkModule(moduleName) {
        return await Module.findOne({ where: { 'name': moduleName } }).then(module => {
            if (module) {
                return module.getDataValue('enabled');
            } else {
                return null;
            }
        });
    },
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
    async checkPsPlus() {
        const savedArticle = await PSPlus.findOne().catch(console.error);
        if (savedArticle) {
            return savedArticle.getDataValue('url');
        } else {
            return '';
        }
    },
    async setPsPlus(url) {
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
    async listPS4() {
        const data = await PSGame.findAll();
        const list = [];
        data.forEach(entry => {
            list.push(entry.getDataValue('title'));
        });
        return list;
    },
    async addPS4(gameTitle, gameUrl) {
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
    async deletePS4(url) {
        const game = await PSGame.findOne({ where: { url: url } });
        if (game) {
            const title = game.getDataValue('title');
            await game.destroy();
            return title;
        } else {
            return '';
        }
    },
    async listSwitch() {
        const data = await SwitchGame.findAll();
        const list = [];
        data.forEach(entry => {
            list.push(entry.getDataValue('title'));
        });
        return list;
    },
    async addSwitch(gameTitle, gameUrl) {
        const game = await SwitchGame.findOne({ where: { url: gameUrl } });
        if (game) {
            return '';
        } else {
            SwitchGame.create({
                title: gameTitle,
                url: gameUrl
            });
            return gameTitle;
        }
    },
    async deleteSwitch(url) {
        const game = await SwitchGame.findOne({ where: { url: url } });
        if (game) {
            const title = game.getDataValue('title');
            await game.destroy();
            return title;
        } else {
            return '';
        }
    },
    async check(platform) {
        let games;
        if (platform === 'ps4') {
            games = await PSGame.findAll();
        } else if (platform === 'switch') {
            games = await SwitchGame.findAll();
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
    async updateOnSale(platform, url) {
        let game;
        if (platform === 'ps4') {
            game = await PSGame.findOne({ where: { url: url } });
        } else if (platform === 'switch') {
            game = await SwitchGame.findOne({ where: { url: url } });
        }
        else {
            console.error;
        }
        game.setDataValue('onSale', !(game.getDataValue('onSale')));
        game.save().catch(console.error);
    }
};