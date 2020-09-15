const schedule = require('node-schedule');
const epic = require('./epic');
const psplus = require('./psplus');

let epicSchedule;
let psPlusSchedule;

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
    async psplus(active, channel) {
        if (active) {
            psPlusSchedule = schedule.scheduleJob('0 * * * *', function () {
                psplus.check(channel);
            });
            console.log('PlayStation Plus schedule on');
        } else if (!active) {
            if (psPlusSchedule) {
                psPlusSchedule.cancel();
            }
            console.log('PlayStation Plus schedule off');
        } else {
            // console.error();
        }
    },
};