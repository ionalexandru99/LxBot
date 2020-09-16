const schedule = require('node-schedule');
const epic = require('./epic');
const psplus = require('./psplus');
const updater = require('./update');

let epicSchedule;
let psPlusSchedule;

module.exports = {

    // Scheduling for Epic Games module
    epic(active, channel) {
        if (active) {
            // Turn on schedule if enabled
            epicSchedule = schedule.scheduleJob('0 12 * * 4', function () {
                // Checks Thursdays at 12:00
                epic.check(channel);
            });
            console.log('Epic Games schedule on');
        } else if (!active) {
            // Turn off schedule if disabled
            if (epicSchedule) {
                epicSchedule.cancel();
            }
            console.log('Epic Games schedule off');
        } else {
            console.error();
        }
    },
    // Scheduling for PlayStation Plus module
    psplus(active, channel) {
        if (active) {
            // Turn on schedule if enabled
            psPlusSchedule = schedule.scheduleJob('0 * * * *', function () {
                // Checks every hour
                psplus.check(channel);
            });
            console.log('PlayStation Plus schedule on');
        } else if (!active) {
            // Turn off schedule if disabled
            if (psPlusSchedule) {
                psPlusSchedule.cancel();
            }
            console.log('PlayStation Plus schedule off');
        } else {
            console.error();
        }
    },
    // Scheduling for tracked titles
    trackedTitles(channel) {
        gamesSchedule = schedule.scheduleJob('0 * * * *', () => {
            // Check every hour
            console.log('Checking for sale updates for tracked PS titles...');
            updater.psUpdate(channel);
            console.log('PS update complete!');

            console.log('Checking for sale updates for tracked eShop titles...');
            updater.eshopUpdate(channel);
            console.log('eShop update complete!');
        });
        console.log('Tracked Games schedule on');
    },
};
