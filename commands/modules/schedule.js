const schedule = require('node-schedule');
const db = require('./dbInterface');
const epic = require('./epic');

let epicSchedule;

module.exports = {

    async epic(active, channel) {
        if (active) {
            epicSchedule = schedule.scheduleJob('0 12 * * 4', function () {
                epic.check(channel);
            });
            console.log('Epic Games schedule on');
        } else if (!active) {
            if (epicSchedule) {
                epicSchedule.cancel();
            }
            console.log('Epic Games schedule off');
        } else {
            console.error();
        }
    },
};