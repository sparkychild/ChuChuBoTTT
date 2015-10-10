var http = require('http');

exports.commands = {
    /**
     * Room Owner commands
     *
     * These commands allow room owners to personalise settings for moderation and command use.
     */

    settings: 'set',
    set: function(arg, by, room) {
        if (!Bot.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;

        var settable = {
            randpoke: 1,
            say: 1,
            joke: 1,
            meme: 1,
            crazyeights: 1,
            blackjack: 1,
            addquote: 1,
            autores: 1,
            quote: 1,
            pair: 1,
            choose: 1,
            usagestats: 1,
            buzz: 1,
            '8ball': 1,
            roomkick: 1,
            addcom: 1,
            viewbannedwords: 1,
            games: 1,
            wifi: 1,
            runtour: 1,
            autoban: 1,
            banword: 1,
            trivia: 1,
            hangman: 1,
            anagrams: 1,
            comlist: 1,
            kunc: 1,
            givepoints: 1
        };
        var modOpts = {
            flooding: 1,
            caps: 1,
            stretching: 1,
            bannedwords: 1
        };

        var opts = arg.split(',');
        var cmd = toId(opts[0]);
        if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
            if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return Bot.say(by, room, 'Incorrect command: correct syntax is ' + config.commandcharacter[0]+ 'set mod, [' +
                Object.keys(modOpts).join('/') + '](, [on/off])');

            if (!this.settings[config.serverid][toId(config.nick)]['modding']) this.settings[config.serverid][toId(config.nick)]['modding'] = {};
            if (!this.settings[config.serverid][toId(config.nick)]['modding'][room]) this.settings[config.serverid][toId(config.nick)]['modding'][room] = {};
            if (opts[2] && toId(opts[2])) {
                if (!Bot.hasRank(by, '#&~')) return false;
                if (!(toId(opts[2]) in {
                        on: 1,
                        off: 1
                    })) return Bot.say(by, room, 'Incorrect command: correct syntax is ' + config.commandcharacter[0]+ 'set mod, [' +
                    Object.keys(modOpts).join('/') + '](, [on/off])');
                if (toId(opts[2]) === 'off') {
                    this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])] = 0;
                }
                else {
                    delete this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])];
                }
                Tools.writeSettings();
                Bot.say(by, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
                return;
            }
            else {
                Bot.say(by, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
                    (this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
                return;
            }
        }
        else {
            if (!Commands[cmd]) return Bot.say(by, room, config.commandcharacter[0]+ '' + opts[0] + ' is not a valid command.');
            var failsafe = 0;
            while (!(cmd in settable)) {
                if (typeof Commands[cmd] === 'string') {
                    cmd = Commands[cmd];
                }
                else if (typeof Commands[cmd] === 'function') {
                    if (cmd in settable) {
                        break;
                    }
                    else {
                        Bot.say(by, room, 'The settings for ' + config.commandcharacter[0]+ '' + opts[0] + ' cannot be changed.');
                        return;
                    }
                }
                else {
                    Bot.say(by, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
                    return;
                }
                failsafe++;
                if (failsafe > 5) {
                    Bot.say(by, room, 'The command "' + config.commandcharacter[0]+ '' + opts[0] + '" could not be found.');
                    return;
                }
            }

            var settingsLevels = {
                off: false,
                disable: false,
                '+': '+',
                '%': '%',
                '@': '@',
                '&': '&',
                '#': '#',
                '~': '~',
                on: true,
                enable: true
            };
            if (!opts[1] || !opts[1].trim()) {
                var msg = '';
                if (!this.settings[config.serverid][toId(config.nick)][cmd] || (!this.settings[config.serverid][toId(config.nick)][cmd][room] && this.settings[config.serverid][toId(config.nick)][cmd][room] !== false)) {
                    msg = '' + config.commandcharacter[0]+ '' + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' and above.';
                }
                else if (this.settings[config.serverid][toId(config.nick)][cmd][room] in settingsLevels) {
                    msg = '' + config.commandcharacter[0]+ '' + cmd + ' is available for users of rank ' + this.settings[config.serverid][toId(config.nick)][cmd][room] + ' and above.';
                }
                else if (this.settings[config.serverid][toId(config.nick)][cmd][room] === true) {
                    msg = '' + config.commandcharacter[0]+ '' + cmd + ' is available for all users in this room.';
                }
                else if (this.settings[config.serverid][toId(config.nick)][cmd][room] === false) {
                    msg = '' + config.commandcharacter[0]+ '' + cmd + ' is not available for use in this room.';
                }
                Bot.say(by, room, msg);
                return;
            }
            else {
                if (!Bot.hasRank(by, '#&~')) return false;
                var newRank = opts[1].trim();
                if (!(newRank in settingsLevels)) return Bot.say(by, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
                if (!this.settings[config.serverid][toId(config.nick)][cmd]) this.settings[config.serverid][toId(config.nick)][cmd] = {};
                this.settings[config.serverid][toId(config.nick)][cmd][room] = settingsLevels[newRank];
                Tools.writeSettings();
                Bot.say(by, room, 'The command ' + config.commandcharacter[0]+ '' + cmd + ' is now ' +
                    (settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
                        (this.settings[config.serverid][toId(config.nick)][cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')));
            }
        }
    },
    /**
     * Help commands
     *
     * These commands are here to provide information about the bot.
     */
    credits: 'about',
    about: function(arg, by, room) {
        if (Bot.hasRank(by, '#&~') || room.charAt(0) === ',') {
            var text = '';
        }
        else {
            text = '/pm ' + by + ', ';
        }
        text += 'Hi!!! n_n I\'m sparkychild\'s PS Bot - Based on Pokémon Showdown Bot by: Quinella, TalkTakesTime, and Morfent';
        Bot.say(by, room, text);
    },
    guide: function(arg, by, room) {
        var text = '';
        if (!Bot.hasRank(by, '&#~') && room.charAt(0) !== ',') {
            text += '/w ' + by + ',';
        }
        if (config.botguide) {
            text += 'A guide on how to use this bot can be found here: ' + config.botguide;
        }
        else {
            text += 'There is no guide for this bot. PM the owner with any questions.';
        }
        Bot.say(by, room, text);
        if (Bot.rankFrom(by, '@')) {
            Bot.say(by, ',' + by, 'Bot Staff guide: http://pastebin.com/t8e7UBV2');
        }
    },
    say: function(arg, by, room) {
        if (!Bot.canUse('say', room, by)) return false;
        Bot.say(by, room, stripCommands(arg));
    },
    joke: function(arg, by, room) {
        if (!Bot.canUse('joke', room, by) || room.charAt(0) === ',') room = ',' + toId(by);
        var reqOpt = {
            hostname: 'api.icndb.com',
            path: '/jokes/random',
            method: 'GET'
        };
        var req = http.request(reqOpt, function(res) {
            res.on('data', function(chunk) {
                try {
                    var data = JSON.parse(chunk);
                    Bot.say(by, room, data.value.joke.replace(/&quot;/g, "\""));
                }
                catch (e) {
                    Bot.say(by, room, 'Sorry, couldn\'t fetch a random joke... :(');
                }
            });
        });
        req.end();
    },
    choose: function(arg, by, room) {
        if (arg.indexOf(',') === -1) {
            var choices = arg.split(' ');
        }
        else {
            choices = arg.split(',');
        }
        choices = choices.filter(function(i) {
            return (toId(i) !== '');
        });
        if (choices.length < 2) return Bot.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + config.commandcharacter[0]+ 'choose: You must give at least 2 valid choices.');

        var choice = choices[Math.floor(Math.random() * choices.length)];
        Bot.say(by, room, ((Bot.canUse('choose', room, by) || room.charAt(0) === ',') ? '' : '/pm ' + by + ', ') + stripCommands(choice));
    },
    usage: 'usagestats',
    usagedata: 'usagestats',
    monousage: 'usagestats',
    monousagedata: 'usagestats',
    usagestats: function(arg, by, room, cmd) {
        var usageLink = 'http://www.smogon.com/stats/2015-09/';
        if (Bot.canUse('usagestats', room, by) || room.charAt(0) === ',') {
            var text = '';
        }
        else {
            text = '/pm ' + by + ', ';
        }
        if (!arg) {
            text += usageLink;
            return Bot.say(by, room, text);
        }
        arg = arg.split(',');
        switch (arg.length) {
            case 3:
                var targetRank = arg[2].replace(/[^0-9]/g, '');
            case 2:
                var targetTier = arg[1].toLowerCase().replace(/[^a-z0-9]/g, '');
            case 1:
                var targetPoke = toId(arg[0]);
                break;
        }
        //get data from a website:
        function getData(link, callback) {
            http.get(link, function(res) {
                var data = '';
                res.on('data', function(part) {
                    data += part;
                });
                res.on('end', function(end) {
                    callback(data);
                });
            });
        }

        //determine tier
        if (!targetTier) {
            switch (room) {
                case 'uu':
                case 'underused':
                    targetTier = 'uu';
                    break;
                case 'rarelyused':
                case 'ru':
                case 'therulers':
                    targetTier = 'ru';
                    break;
                case 'pu':
                    targetTier = 'pu';
                    break;
                case 'lc':
                case 'littlecup':
                    targetTier = 'lc';
                    break;
                case 'overused':
                case 'ou':
                    targetTier = 'ou';
                    break;
                case 'smogondoubles':
                    targetTier = 'doublesou';
                    break;
                default:
                    //determine a pokemon's tier from showdown's data
                    if (!pokemonData[targetPoke]) {
                        return Bot.say(by, room, text + 'Invalid Pokemon');
                    }
                    targetTier = toId(pokemonData[targetPoke].tier);
                    if (targetTier === 'nfe') {
                        targetTier = 'pu';
                    }
                    break;
            }
        }
        var destination = targetTier + '-' + (targetRank || '1500') + '.txt';
        if (cmd !== 'monousage' && cmd !== 'monousagedata') {
            var index;
            getData(usageLink + destination, function(data) {
                var usageStats = data.split('\n');
                if (usageStats[0].indexOf(' Total battles:') === -1) {
                    return Bot.say(by, room, text + 'ERROR: Invalid Tier/Failed to get data.');
                }
                for (var i = 5; i < usageStats.length; i++) {
                    var tarStats = usageStats[i].replace(/ /g, '').split('|');
                    if (!tarStats[2]) {
                        continue;
                    }
                    if (toId(tarStats[2]) === targetPoke) {
                        index = i - 5;
                        return Bot.say(by, room, text + tarStats[2] + ' - #' + tarStats[1] + ' in ' + targetTier.toUpperCase() + '| Usage: ' + tarStats[3] + '| Raw Count: ' + tarStats[4]);
                    }
                }
                return Bot.say(by, room, text + 'Pokémon not found.');
            }.bind(this));
            if (cmd === 'usagedata') {
                getData(usageLink + 'moveset/' + destination, function(data) {
                    data = data.split(' +----------------------------------------+ \n +----------------------------------------+ ');
                    var moveSetData = data[index];
                    if (!moveSetData) {
                        return Bot.say(by, room, 'Error in parsing data.');
                    }
                    var tarData = moveSetData.split('\n');
                    var moves = '';
                    var teammates = '';
                    var items = [];
                    var checks = [];
                    for (var i = 0; i < tarData.length; i++) {
                        if (toId(tarData[i]) === 'moves') {
                            moves = tarData.slice(i + 1, i + 5).join(', ').replace(/[^A-Za-z\,\s]/g, '').replace(/[\s]{2,}/g, '').replace(/,/g, ', ');
                        }
                        if (toId(tarData[i]) === 'items') {
                            for (var j = 1; j < 5; j++) {
                                if (!tarData[i + j] || !toId(tarData[i + j])) {
                                    break;
                                }
                                items.push(tarData[(i + j)].replace(/[^A-Za-z\s]/g, '').replace(/[\s]{2,}/g, ''));
                            }
                        }
                        if (toId(tarData[i]) === 'teammates') {
                            teammates = tarData.slice(i + 1, i + 5).join(', ').replace(/[^A-Za-z\,\s]/g, '').replace(/[\s]{2,}/g, '').replace(/,/g, ', ');
                        }
                        if (toId(tarData[i]) === 'checksandcounters') {
                            for (var j = 1; j < 8; j = j + 2) {
                                if (!tarData[i + j]) {
                                    continue;
                                }
                                checks.push(tarData[(i + j)].split(' ')[2]);
                            }
                        }
                    }
                    Bot.say(by, room, text + 'Common moves are: __' + moves.trim() + '__ **|** Common items include: __' + items.join(', ').trim() + '__');
                    Bot.say(by, room, text + 'Common partners include: __' + teammates.trim() + '__ **|** Commonly used checks and counters: __' + checks.join(', ') + '__.');
                }.bind(this));
            }
        }
        else {
            if (!targetTier) {
                return Bot.say(by, room, 'Please include the type.');
            }
            getData(usageLink + '/monotype/monotype-mono' + destination.replace('mono', ''), function(data) {
                var usageStats = data.split('\n');
                if (usageStats[0].indexOf(' Total battles:') === -1) {
                    return Bot.say(by, room, text + 'ERROR: Invalid type/Failed to get data.');
                }
                for (var i = 5; i < usageStats.length; i++) {
                    var tarStats = usageStats[i].replace(/ /g, '').split('|');
                    if (!tarStats[2]) {
                        continue;
                    }
                    if (toId(tarStats[2]) === targetPoke) {
                        index = i - 5;
                        return Bot.say(by, room, text + tarStats[2] + ' - #' + tarStats[1] + ' in ' + targetTier.toUpperCase() + '| Usage: ' + tarStats[3] + '| Raw Count: ' + tarStats[4]);
                    }
                }
                return Bot.say(by, room, text + 'Pokémon not found.');
            }.bind(this));
        }
        if (cmd === 'monousagedata') {
            getData(usageLink + '/monotype/moveset/monotype-mono' + destination, function(data) {
                data = data.split(' +----------------------------------------+ \n +----------------------------------------+ ');
                var moveSetData = data[index];
                if (!moveSetData) {
                    return Bot.say(by, room, 'Error in parsing data.');
                }
                var tarData = moveSetData.split('\n');
                var moves = '';
                var teammates = [];
                var items = [];
                for (var i = 0; i < tarData.length; i++) {
                    if (toId(tarData[i]) === 'moves') {
                        moves = tarData.slice(i + 1, i + 5).join(', ').replace(/[^A-Za-z\,\s]/g, '').replace(/[\s]{2,}/g, '').replace(/,/g, ', ');
                    }
                    if (toId(tarData[i]) === 'items') {
                        for (var j = 1; j < 5; j++) {
                            if (!tarData[i + j] || !toId(tarData[i + j])) {
                                break;
                            }
                            items.push(tarData[(i + j)].replace(/[^A-Za-z\s]/g, '').replace(/[\s]{2,}/g, ''));
                        }
                    }
                    if (toId(tarData[i]) === 'teammates') {
                        for (var j = 1; j < 5; j++) {
                            if (!tarData[i + j] || !toId(tarData[i + j])) {
                                break;
                            }
                            teammates.push(tarData[(i + j)].replace(/[^A-Za-z\s]/g, '').replace(/[\s]{2,}/g, ''));
                        }
                    }
                }
                Bot.say(by, room, text + 'Common moves are: __' + moves.trim() + '__ **|** Common items include: __' + items.join(', ').trim() + '__');
                Bot.say(by, room, text + 'Common partners include: __' + teammates.join(', ').trim() + '__.');
            }.bind(this));
        }
    },
    seen: function(arg, by, room) { // this command is still a bit buggy
        var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
        arg = toId(arg);
        if (!arg || arg.length > 18) return Bot.say(by, room, text + 'Invalid username.');
        if (arg === toId(by)) {
            text += 'Have you looked in the mirror lately?';
        }
        else if (arg === toId(config.nick)) {
            text += 'You might be either blind or illiterate. Might want to get that checked out.';
        }
        else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
            text += 'The user ' + arg + ' has never been seen.';
        }
        else {
            text += arg + ' was last seen ' + Tools.getTimeAgo(this.chatData[arg].seenAt) + ' ago' + (
                this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
        }
        Bot.say(by, room, text);
    },
    repeat: function(arg, by, room) {
        if (room.charAt(0) === ',') return false;
        if (!arg) return false;

        if (!Bot.hasRank(by, '#') || !Bot.rankFrom(by, '+')) return false;
        if (Bot.repeatON[room]) {
            return Bot.say(by, room, 'There is already a repeat happening in this room.');
        }

        var spl = arg.split(',');
        var tarTime = spl[0].replace(/[^0-9\.]/g, '') * 60 * 1000;
        if (!spl[0] || !spl[1]) {
            Bot.say(by, room, 'The format is repeat [minutes], [text]');
            return false;
        }
        if (isNaN(tarTime) || tarTime < 5 * 60000) {
            return Bot.say(by, room, 'Please use a valid time interval more than 5 minutes.');
        }
        Bot.say(by, room, 'I will be repeating that text once every ' + tarTime / 60000 + ' minutes.');
        Bot.repeatON[room] = true;
        Bot.repeatText[room] = setInterval(function() {
            Bot.talk(room, stripCommands(spl.slice(1).join(',').trim()).replace('//wall', '/wall').replace('//declare', '/declare'));
        }.bind(this), tarTime);
    },
    stoprepeat: function(arg, by, room) {
        if (room.charAt(0) === ',') return false;
        if (!Bot.hasRank(by, '#') && !Bot.repeatON[room]) return false;
        clearInterval(Bot.repeatText[room]);
        Bot.say(by, room, 'This repeat was ended');
        delete Bot.repeatON[room];
    },
    tell: 'mail',
    mail: function(arg, by, room) {
        var mailbl = fs.readFileSync('data/mailbl.txt').toString().split('\n');
        var spl = arg.split(', ');
        if (!spl[0] || !spl[1]) return Bot.say(by, ',' + by, 'The correct format is +mail [user], [msg]');
        var destination = toId(spl[0]);
        if (mailbl.indexOf(toId(by)) > -1 && destination !== toId(by)) return Bot.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'Swish, mail has been sent to ' + destination + '!');
        spl = spl.slice(1).join(', ');
        fs.appendFile('data/mail.txt', destination + '|' + spl + ' - ' + by + '\n', function() {
            Bot.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'Swish, mail has been sent to ' + destination + '!');
        }.bind(this));
        var d = new Date();
        if (mailbl.indexOf(toId(by)) > -1) return false;
        fs.appendFile('data/maillog.txt', destination + '|' + spl + ' - ' + toId(by) + '~' + d + '\n', function(err) {
            if (err) {
                Bot.say(by, room, 'There was an error, please report this to sparkychild.');
                throw err;
            }
        });
    },
    checkmail: function(arg, by, room) {
        if (!Plugins.checkMail(by, room)) return Bot.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'You have no mail ;-;');
        if (room.charAt !== ',') {
            room = ',' + toId(by);
        }
        Plugins.mailUser(by, room);
    },
    regdate: 'userdata',
    rank: 'userdata',
    userdata: function(arg, by, room, cmd) {
        if (!Bot.hasRank(by, '+%@#~&') && room.charAt(0) !== ',') {
            room = ',' + by;
        }
        if (!arg) {
            arg = by;
        }

        function getData(link, callback) {
            http.get(link, function(res) {
                var data = '';
                res.on('data', function(part) {
                    data += part;
                });
                res.on('end', function(end) {
                    callback(data);
                });
            });
        }
        getData('http://pokemonshowdown.com/users/' + toId(arg) + '.json', function(data) {
            try {
                data = JSON.parse(data);
            }
            catch (e) {
                Bot.say(by, room, 'ERROR in retrieving data.');
            }
            switch (cmd) {
                case 'regdate':
                    if (data.registertime === 0) {
                        return Bot.say(by, room, 'The account ' + arg + ' is not registered.');
                    }
                    var regdate = data.registertime * 1000 - (1000 * 60 * 60 * 4);
                    var regDate = (new Date(regdate)).toString().substr(4, 20);
                    Bot.say(by, room, 'The account ' + arg + ' was registered on ' + regDate + ' (EST).');
                    break;
                case 'rank':
                    var battleRanks = data.ratings;
                    var text = '';
                    for (var tier in battleRanks) {
                        text += tier + ': __' + battleRanks[tier].elo.split('.')[0].trim() + '/' + battleRanks[tier].gxe + 'GXE__ | ';
                    }
                    Bot.say(by, room, 'User: ' + arg + ' -- ' + text.trim());
                    break;
            }
        });
    }
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals Plugins */
/* globals fs */
/* globals stripCommands */
/* globals Tools */
/* globals Commands */
/* globals pokemonData */
