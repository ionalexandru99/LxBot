const schedule = require('node-schedule');
const epic = require('./epic');
const psplus = require('./psplus');
const gamepass = require('./gamepass');
const updater = require('./update');
require('dotenv').config();

module.exports = {

    // Scheduling for Epic Games module
    epic(channel) {
        if (process.env.scheduleEpic !== '') {
            // Turn on schedule
            const epicSchedule = schedule.scheduleJob(process.env.scheduleEpic, function () {
                epic.check(channel);
            });
            if (epicSchedule)
                console.log('Epic Games schedule on');
            else
                console.log("Epic Games schedule incorrectly configured")
        } else {
            // Schedule off
            console.log('Epic Games schedule off');
        }
    },
    // Scheduling for PlayStation Plus module
    psplus(channel) {
        if (process.env.schedulePsPlus !== '') {
            // Turn on schedule
            const psPlusSchedule = schedule.scheduleJob(process.env.schedulePsPlus, function () {
                psplus.check(channel);
            });
            if (psPlusSchedule)
                console.log('PlayStation Plus schedule on');
            else
                console.log("PlayStation Plus schedule incorrectly configured")
        } else {
            // Schedule off
            console.log('PlayStation Plus schedule off');
        }
    },
    // Scheduling for Xbox Game Pass module
    gamepass(channel) {
        if (process.env.scheduleGamePass !== '') {
            // Turn on schedule
            const gamePassSchedule = schedule.scheduleJob(process.env.scheduleGamePass, function () {
                gamepass.check(channel);
            });
            if (gamePassSchedule)
                console.log('Xbox Game Pass schedule on');
            else
                console.log("Xbox Game Pass schedule incorrectly configured")
        } else {
            // Schedule off
            console.log('Xbox Game Pass schedule off');
        }
    },
    // Scheduling for tracked titles
    trackedTitles(channel) {
        if (process.env.scheduleTracked !== '') {
            // Turn on schedule
            const trackedSchedule = schedule.scheduleJob(process.env.scheduleTracked, () => {
                console.log('Checking for sale updates for tracked PS titles...');
                updater.psUpdate(channel).then(() => console.log('PS update complete!'));

                console.log('Checking for sale updates for tracked eShop titles...');
                updater.eshopUpdate(channel).then(() => console.log('eShop update complete!'));
            });
            if (trackedSchedule)
                console.log('Tracked Games schedule on');
            else
                console.log("Tracked Games schedule incorrectly configured")
        } else {
            // Schedule off
            console.log('Tracked Games schedule off');
        }
    },
};
