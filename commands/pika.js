const Discord = require('discord.js');

module.exports = {
    name: 'pika',
    description: 'pika pika',
    cooldown: 1,

    async execute(message) {

        try {
            // Generate image URL
            const imageID = Math.floor(Math.random() * 3) + 1;
            const imageURL = 'https://santoyoalfredo.github.io/assets/images/fun/' + imageID + '.jpg';

            // Create embed
            const embed = new Discord.MessageEmbed().setImage(imageURL);
            return message.channel.send(embed);
        }
        catch (error) {
            console.log(error);
            return message.channel.send(`There was an error while executing this command`);
        }
    }
};
