exports.commands = {
    m: 'mute',
    mute: function(arg, by, room) {
        if (!Bot.hasRank(by, '@') || !arg) return false;
        arg = arg.split(',');
        var user = toId(arg[0]);
        if (!Bot.outrank(by, user)) return false;
        if (Bot.isBanned(user)) return Bot.say(by, room, user + ' is already banned/muted from using the bot.');
        var duration = arg[1];
        var action = Bot.mute(user, duration, by);
        if (action) return Bot.say(by, room, toId(user) + ' was muted from using the bot for ' + duration + ' minutes by' + by);
    },
    um: 'unmute',
    unmute: function(arg, by, room) {
        if (!Bot.hasRank(by, '@') || !arg) return false;
        var target = toId(arg);
        if (!Bot.outrank(by, target)) return false;
        if (!Bot.mutes[target]) return Bot.say(by, room, 'User ' + target + ' is not muted!');
        delete Bot.mutes[target];
        Bot.say(by, room, target + ' has been unmuted.');
    },
    monitor: function(arg, by, room) {
        if (!Bot.rankFrom(by, '~')) return false;
        if (room.charAt(0) === ',') return false;
        if (!arg || ['on', 'off'].indexOf(toId(arg)) === -1) return Bot.say(by, room, 'ResourceMonitor is ' + (this.settings[config.serverid][toId(config.nick)].monitor[room] ? 'OFF' : 'ON') + '.');
        var state = toId(arg);
        if (!this.settings[config.serverid][toId(config.nick)].monitor) {
            this.settings[config.serverid][toId(config.nick)].monitor = {};
        }
        switch (state) {
            case 'on':
                this.settings[config.serverid][toId(config.nick)].monitor[room] = false;
                break;
            case 'off':
                this.settings[config.serverid][toId(config.nick)].monitor[room] = true;
                break;
        }
        Bot.say(by, room, 'ResourceMonitor is now ' + state.toUpperCase() + ' in room ' + this.rooms[room].name + '.');
        Tools.writeSettings();
        monitor('ResourceMonitor is now ' + state.toUpperCase() + ' in room ' + this.rooms[room].name + '.');
    },
    botlog: function(arg, by, room) {
        if (!Bot.rankFrom(by, '@')) return false;
        room = ',' + by;
        arg = arg.replace(', ', ',').split(',');

        var botLogs = fs.readFileSync('data/botlog.txt').toString().split('\n');

        var text = '';

        for (var i = 0; botLogs.length > i; i++) {
            for (var j = 0; j < arg.length; j++) {
                var addText = false;
                if (botLogs[i].indexOf(arg[j].trim()) === -1) {
                    addText = false;
                    continue;
                }
                if (addText) {
                    text += botLogs[i] + '\n\n';
                }
            }
        }
        Tools.uploadToHastebin(text, function(link) {
            Bot.say(by, room, 'List: ' + link);
        }.bind(this));
    },

    bot: function(arg, by, room) {
        arg = arg.replace(/, /g, ',').split(',');
        if (!arg[1] && arg[0] !== 'auth' && arg[0] !== 'help') {
            return false;
        }
        if (arg[1]) {
            var target = toId(arg[1]);
        }
        var action = arg[0];
        switch (action) {
            case 'voice':
                if (!Bot.rankFrom(by, '@') || Bot.botRank(target) === '+' || !Bot.outrank(by, target)) return false;
                if (Bot.botRank(target) === ' ') {
                    fs.appendFile('data/ranks.txt', '+' + target + '\n');
                }
                else {
                    var ranks = fs.readFileSync('data/ranks.txt').toString();
                    ranks = ranks.replace(Bot.botRank(target) + target + '\n', '+' + target + '\n');
                    fs.writeFileSync('data/ranks.txt', ranks);
                }
                Bot.say(by, room, target + ' was appointed BotVoice by ' + by);
                Bot.botlog('global', target + ' was appointed BotVoice by ' + by);
                break;
            case 'deauth':
                if (!Bot.outrank(by, target) || Bot.botRank(target) === ' ') return false;
                ranks = fs.readFileSync('data/ranks.txt').toString();
                ranks = ranks.replace(Bot.botRank(target) + target + '\n', '');
                fs.writeFileSync('data/ranks.txt', ranks);
                Bot.say(by, room, '(' + target + ' no longer has BotAuth.)');
                Bot.botlog('global', '(' + target + ' no longer has BotAuth by ' + by + ')');
                break;
            case 'mod':
                if (!Bot.rankFrom(by, '~') || Bot.botRank(target) === '@') return false;
                if (Bot.botRank(target) === ' ') {
                    fs.appendFile('data/ranks.txt', '@' + target + '\n');
                }
                else {
                    ranks = fs.readFileSync('data/ranks.txt').toString();
                    ranks = ranks.replace(Bot.botRank(target) + target + '\n', '@' + target + '\n');
                    fs.writeFileSync('data/ranks.txt', ranks);
                }
                Bot.say(by, room, target + ' was appointed BotMod by ' + by);
                Bot.botlog('global', target + ' was appointed BotMod by ' + by);
                break;
            case 'admin':
                if (!Bot.rankFrom(by, '~') || Bot.botRank(target) === '~') return false;
                if (Bot.botRank(target) === ' ') {
                    fs.appendFile('data/ranks.txt', '~' + target + '\n');
                }
                else {
                    ranks = fs.readFileSync('data/ranks.txt').toString();
                    ranks = ranks.replace(Bot.botRank(target) + target + '\n', '~' + target + '\n');
                    fs.writeFileSync('data/ranks.txt', ranks);
                }
                Bot.say(by, room, target + ' was appointed BotAdmin by ' + by);
                Bot.botlog('global', target + ' was appointed BotAdmin by ' + by);
                break;
            case 'auth':
                ranks = fs.readFileSync('data/ranks.txt').toString().split('\n');
                var voice = [];
                var mod = [];
                var admin = [];
                for (var i = 0; i < ranks.length; i++) {
                    if (!ranks[i]) {
                        continue;
                    }
                    switch (ranks[i].charAt(0)) {
                        case '~':
                            admin[admin.length] = ranks[i].slice(1);
                            break;
                        case '@':
                            mod[mod.length] = ranks[i].slice(1);
                            break;
                        case '+':
                            voice[voice.length] = ranks[i].slice(1);
                            break;
                    }
                }
                var text = '~Administrators (' + admin.length + '):\n' + admin.join(', ') + '\n\n@Moderators (' + mod.length + '):\n' + mod.join(', ') + '\n\n+Voices (' + voice.length + '):\n' + voice.join(', ');
                Tools.uploadToHastebin(text, function(link) {
                    Bot.say(by, (Bot.rankFrom(by, '+') ? room : ',' + by), 'BotAuth: ' + link);
                }.bind(this));
                break;
            default:
                if (!Bot.rankFrom(by, '@')) return false;
                Bot.say(by, ',' + by, 'The possible commands are +bot [voice/mod/admin/deauth].');

        }
    },
    banmail: 'mailban',
    mailban: function(arg, by, room) {
        if (!Bot.rankFrom(by, '@')) return false;
        if (!Bot.outrank(by, arg)) return false;
        if (room.charAt(0) !== ',') return false;
        arg = toId(arg);
        fs.appendFile('data/mailbl.txt', arg + '\n', function() {
            Bot.say(by, room, arg + ' is now banned from using ' + config.commandcharacter[0] + 'mail');
        }.bind(this));
        Bot.botlog('global', arg + ' was banned from using mail by ' + by);
    },
    maillog: 'maillogs',
    maillogs: function(arg, by, room) {
        if (room.charAt(0) !== ',') return false;
        if (!Bot.rankFrom(by, '@')) return false;
        var maillogs = fs.readFileSync('data/maillog.txt').toString().split('\n');
        var data = '';
        for (var i = 0; i < maillogs.length; i++) {
            if (!maillogs[i]) {
                continue;
            }
            var splmsg = maillogs[i].split('|');
            var spluser = maillogs[i].split(' - ');
            var spldate = maillogs[i].split('~');
            var date = spldate[spldate.length - 1];
            var iddx = spluser[spluser.length - 1].indexOf('~' + date);
            var sender = spluser[spluser.length - 1].slice(0, iddx);
            var tarGet = splmsg[0];
            splmsg = splmsg.slice(1).join('|');
            var idx = splmsg.indexOf(' - ' + sender + '~');
            var temp = splmsg.slice(0, idx);
            if (toId(arg) && toId(arg) !== 'all') {
                if (toId(sender) === toId(arg)) {
                    data += '[' + date + ']  ' + sender + ' (private to ' + tarGet + '): ' + temp + '\n\n';
                }
                continue;
            }
            data += '[' + date + ']  ' + sender + ' (private to ' + tarGet + '): ' + temp + '\n\n';
        }
        if (!data) return Bot.say(by, room, 'Sorry, no logs found.');
        Tools.uploadToHastebin(data, function(link) {
            Bot.say(by, room, 'Logs of .mail: ' + link);
        }.bind(this));
    },
    banroom: function(arg, by, room) {
        if (!Bot.rankFrom(by, '~')) return false;
        fs.appendFile('data/bannedrooms.txt', '\n' + toId(arg));
        Bot.botlog('global', arg + ' room was banned from using the bot by ' + by);
        Bot.say(by, room, 'RIP ' + arg);
    },
    botban: function(arg, by, room) {
        if (!Bot.rankFrom(by, '@')) return false;
        if (!Bot.outrank(by, arg)) return false;
        var banned = fs.readFileSync('data/commandban.txt').toString().split('\n');
        if (banned.indexOf(toId(arg)) > -1) return Bot.say(by, room, 'User is already banned.');
        fs.appendFile('data/commandban.txt', toId(arg) + '\n');
        Bot.say(by, room, arg + ' was banned from using the bot by ' + by);
        Bot.botlog('global', arg + ' was banned from using the bot by ' + by);
        Commands.bot.call(this, 'deauth, ' + arg, config.nick, room);
    },
    botunban: function(arg, by, room) {
        if (!Bot.rankFrom(by, '@')) return false;
        if (!Bot.outrank(by, arg)) return false;
        var banned = fs.readFileSync('data/commandban.txt').toString();
        arg = toId(arg);
        var search = '\n' + arg + '\n';

        var idx = banned.indexOf(search);
        banned = banned.replace(new RegExp(search, "g"), '\n');
        fs.writeFileSync('data/commandban.txt', banned);
        if (idx === -1) {
            return Bot.say(by, room, 'User not found.');
        }
        else {
            Bot.say(by, room, 'Done.');
        }
        Bot.botlog('global', arg + ' was unbanned from using the bot by ' + by);

    },
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals monitor */
/* globals toId */
/* globals Bot */
/* globals config */
/* globals Tools */
/* globals Commands */
/* globals fs */
