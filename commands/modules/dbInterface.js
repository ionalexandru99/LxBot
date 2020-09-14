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
    name: Sequelize.STRING,
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
        await Module.findOrCreate({
            where: {
                name: "epic",
                enabled: false,
            }
        });

        await Module.findOrCreate({
            where: {
                name: "psplus",
                enabled: false,
            }
        });
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


        // const module = await Module.findOne({ where: { 'name': moduleName } });
        // if (module) {
        //     module.setDataValue('enabled', !(module.getDataValue('enabled')));
        //     module.save().catch(console.error);
        //     return module.getDataValue('enabled');
        // } else {
        //     return null;
        // }
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
        const game = PSGame.create({
            title: gameTitle,
            url: gameUrl
        });
    },
    async deletePS4(url) {
        const game = await PSGame.findOne({ where: { url: url } });
        const title = game.getDataValue('title');
        await game.destroy();
        return title;
    },
    async check(platform) {
        switch (platform) {
            case 'ps4':
                const games = await PSGame.findAll();
                return (
                    games.map(game => ({
                        url: game.getDataValue('url'),
                        onSale: game.getDataValue('onSale'),
                    })
                    )
                );
            default:
                console.error;
        }
    },
    async updateOnSale(url) {
        const game = await PSGame.findOne({ where: { url: url } });
        game.setDataValue('onSale', !(game.getDataValue('onSale')));
        game.save().catch(console.error);
    }
};