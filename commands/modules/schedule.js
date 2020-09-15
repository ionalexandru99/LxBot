const schedule = require('node-schedule');
const epic = require('./epic');
const psplus = require('./psplus');
const updater = require('./update');

let epicSchedule;
let psPlusSchedule;

module.exports = {

    epic(active, channel) {
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
    psplus(active, channel) {
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
            console.error();
        }
    },
    trackedGames(channel) {
        gamesSchedule = schedule.scheduleJob('0 * * * *', async function () {
            console.log('Checking for sale updates for tracked PS titles...');
            await updater.psUpdate(channel);
            console.log('PS update complete!');

            console.log('Checking for sale updates for tracked eShop titles...');
            await updater.eshopUpdate(channel);
            console.log('eShop update complete!');

        });
        console.log('Tracked Games schedule on');
    },
};