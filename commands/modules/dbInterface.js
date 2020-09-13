const { Sequelize } = require('sequelize');
const { dbName, dbUser, dbPass } = require('../../config.json');

const sequelize = new Sequelize(dbName, dbUser, dbPass, {
    dialect: 'postgres'
})

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
        await PSGame.sync();
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
    async checkPS4() {
        const games = await PSGame.findAll();
        return (
            games.map(game => ({
                url: game.getDataValue('url'),
                onSale: game.getDataValue('onSale'),
            })
            )
        );
    },
    async updateOnSale(url) {
        const game = await PSGame.findOne({ where: { url: url } });
        game.setDataValue('onSale', !(game.getDataValue('onSale')));
        game.save().catch(console.error);
    }
};