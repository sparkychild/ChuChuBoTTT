exports.commands = {
    //commands for score and such
    resetleaderboard: function(arg, by, room) {
        if (!Bot.hasRank(by, '#~')) return false;
        Economy.clear(room, by);
        Bot.say(by, room, 'The leaderboard has been reset.');
    },
    registerroom: function(arg, by, room) {
        if (room.charAt(0) === ',' || !Bot.rankFrom(by, '~')) return false;
        if (Economy.addRoom(room)) {
            return Bot.say(by, room, 'An individual leaderboard has been enabled for this room.');
        }
        else {
            return Bot.say(by, room, 'An individual leaderboard already exists for this room.');
        }
    },
    deregisterroom: function(arg, by, room) {
        if (room.charAt(0) === ',' || !Bot.rankFrom(by, '~')) return false;
        if (Economy.deleteRoom(room)) {
            return Bot.say(by, room, 'The individual leaderboard has been deleted for this room.');
        }
        else {
            return Bot.say(by, room, 'An individual leaderboard does not exist for this room.');
        }
    },
    takepoints: 'givepoints',
    givepoints: function(arg, by, room, cmd) {
        if (!Bot.canUse('givepoints', room, by) || !arg) return false;
        if (!Economy.isRegistered(room) && !Bot.rankFrom(by, '@')) return false;
        arg = arg.split(',');
        if (arg.length !== 2) return false;
        var target = toId(arg[0]);
        var amount = toId(arg[1]).replace(/[^0-9]/g, '');
        if (!amount) return;
        if (cmd === 'takepoints') amount = amount * -1;
        Economy.give(target, amount * 1, room);
        if (amount < 0) {
            return Bot.say(by, room, target + ' has lost ' + amount * -1 + ' ' + Economy.currency(room));
        }
        return Bot.say(by, room, target + ' has been given ' + amount + ' ' + Economy.currency(room));
    },
    points: 'atm',
    score: 'atm',
    wallet: 'atm',
    atm: function(arg, by, room) {
        if (!Bot.hasRank(by, '+%@#&~')) {
            var targetRoom = ',' + by;
        }
        else {
            targetRoom = room;
        }
        if (arg) {
            var user = arg.split(',')[0];
            if (arg.split(',')[1]) {
                room = toId(arg.split(',')[1]);
            }
        }
        var target = user || by;
        return Bot.say(by, targetRoom, '(' + (Economy.isRegistered(room) ? room : 'global') + ') ' + target + ' has ' + Economy.getPoints(target, room) + ' ' + Economy.currency(room));
    },
    top: function(arg, by, room) {
        if (!Bot.hasRank(by, '+%@#&~')) {
            var targetRoom = ',' + by;
        }
        else {
            targetRoom = room;
        }
        if (arg) {
            room = toId(arg);
        }
        Bot.say(by, targetRoom, Economy.getTop(room));
    },
    leaderboard: function(arg, by, room) {
        if (!Bot.hasRank(by, '+%@#&~')) {
            var targetRoom = ',' + by;
        }
        else {
            targetRoom = room;
        }
        if (arg) {
            room = toId(arg);
        }
        var text = Economy.getHastebinLeaderboard(room);
        Tools.uploadToHastebin(text, function(link) {
            return Bot.say(by, targetRoom, link);
        }.bind(this));
    },
    config: 'cp',
    cp: function(arg, by, room) {
        if (!Bot.hasRank(by, '#~') || !arg) return false;
        if (!Economy.isRegistered(room) && !Bot.rankFrom(by, '~')) return false;
        arg = arg.split(',');
        if (arg.length !== 2) return false;
        var param = toId(arg[0]);
        var value = arg[1].trim();
        if (!param || !value) return false;
        if (Economy.isRegistered(room)) {
            var economyCP = Economy.economy.rooms[room].cp;
        }
        else {
            economyCP = Economy.economy.global.cp;
        }
        switch (param) {
            case 'currency':
            case 'name':
            case 'points':
                economyCP.currency = value;
                Bot.say(by, room, '"Points" renamed to ' + value);
                break;
            case 'factor':
            case 'payout':
                value = toId(value);
                if (/[^0-9]/i.test(value)) {
                    return Bot.say(by, room, 'Invalid value.');
                }
                economyCP.factor = value * 1;
                Bot.say(by, room, 'Payout factor for winning games is: ' + value);
                break;
        }
        Economy.write();
    },
    lbhelp: 'leaderboardhelp',
    leaderboardhelp: function(arg, by, room) {
        if (!Bot.hasRank(by, '@#&~')) room = ',' + by;
        Bot.say(by, room, 'http://pastebin.com/am4FgVCH');
    }
};

/****************************
 *       For C9 Users        *
 *****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals Tools */
/* globals Economy */
