//resource Monitor settings:
const MONITOR = {
    USER: 12,
    TOTAL: 90,
    COMMAX: 8,
    PREVENTION: 6,
    WARNING: {
        1: 7,
        2: 30,
        3: 90,
        4: 360,
        5: 1440
    }
}

//global.Bot 
exports.Bot = {
    ranks: {},
    monitor: {
        usage: 0,
        user: {},
        repeat: {},
        pattern: [],
        warnings: {}
    },
    repeatON: {},
    repeatText: {},
    mutes: {},
    initMonitor: function() {
        //reset ResourceMonitor
        setInterval(function() {
            var warnings = this.monitor.warnings;
            var repeat = this.monitor.repeat;
            var pattern = this.monitor.pattern;
            this.monitor = {
                usage: 0,
                user: {},
                pattern: pattern,
                repeat: repeat,
                warnings: warnings
            };
        }.bind(this), 1 * 60 * 1000);
    },
    mute: function(user, duration, by) {
        if (!by) {
            by === '~ResourceMonitor';
        }
        if (!duration) {
            duration = 7;
        }
        duration = duration * 1;
        if (isNaN(duration)) {
            duration = 7;
        }
        user = toId(user);
        this.botlog('global', toId(user) + ' was muted from using the bot for ' + duration + ' minutes by' + by);
        if (this.isBanned(user)) return false;
        var d = new Date();
        var date = d.valueOf();
        this.mutes[user] = date + duration * 1000 * 60;
        return true;
    },
    isBanned: function(by) {
        var commandban = fs.readFileSync('data/commandban.txt').toString().split('\n');
        var user = toId(by);
        if (this.mutes[user]) {
            var d = new Date();
            var date = d.valueOf();
            if (this.mutes[user] * 1 <= date * 1) {
                this.mutes[user] = false;
            }
        }
        return (((commandban.indexOf(toId(by)) > -1) || this.mutes[toId(by)]) && !this.isDev(by));
    },
    botlog: function(room, message) {
        if (room === 'joim') {
            return false;
        }
        if (!room) {
            room = 'global';
        }
        var d = new Date();
        fs.appendFile('data/botlog.txt', '(' + d + ') (' + room + ') ' + message + '\n');
    },
    botBanTransfer: function(target, oldName) {
        target = toId(target);
        if (this.mutes[toId(oldName)]) {
            var end = this.mutes[oldName];
            if (this.mutes[target]) {
                if (this.mutes[target] < end) {
                    this.mutes[target] = end;
                }
            }
            else {
                this.mutes[target] = end;
            }
        }

        var commandban = fs.readFileSync('data/commandban.txt').toString().split('\n');

        if (!oldName) return;
        if (this.rankFrom(target, '+') && commandban.indexOf(oldName) > -1) {
            this.botlog('global', target + ' would be added to botban list, but has rank ' + this.botRank(target) + ' (Alt of: ' + oldName + ')');
            return false;
        }
        if (commandban.indexOf(toId(oldName)) === -1) {
            return;
        }
        else {
            if (commandban.indexOf(toId(target)) > -1) return;
            fs.appendFile('data/commandban.txt', target + '\n');
            this.botlog('global', 'Automatically added to botBan list: ' + target + ' (Alt of: ' + oldName + ')');
        }
    },
    outrank: function(by, target) {
        if (this.isDev(by) || this.botRank(by) === '~') return true;

        var ranks = ' +@~';
        var outrank = (ranks.indexOf(this.botRank(by)) > ranks.indexOf(this.botRank(target)));
        return outrank;
    },
    botRank: function(by) {
        var rankData = fs.readFileSync('data/ranks.txt').toString().split('\n');
        for (var i = 0; i < rankData.length; i++) {
            if (!rankData[i]) {
                continue;
            }
            if (toId(by) === toId(rankData[i])) {
                return rankData[i].charAt(0);
            }
        }
        return ' ';
    },
    isDev: function(by) {
        if (!by) return false;
        var isDev = (devList.indexOf(toId(by)) !== -1);
        return isDev;
    },
    rankFrom: function(by, rank) {
        var ranks = '+@~';
        var enoughRank = (ranks.indexOf(this.botRank(by)) >= ranks.indexOf(rank));
        return (enoughRank || this.isDev(by));
    },

    hasRank: function(by, rank) {
        if (this.isDev(by)) return true;
        if ((rank.indexOf('+') > -1 || rank.indexOf('%') > -1) && this.rankFrom(by, '+')) {
            return true;
        }
        else if ((rank.indexOf('&') > -1 || rank.indexOf('@') > -1) && this.rankFrom(by, '@')) {
            return true;
        }
        else if ((rank.indexOf('#') > -1 || rank.indexOf('~') > -1) && this.rankFrom(by, '~')) {
            return true;
        }
        else {
            return this.haveRank(by, rank)
        }
    },
    eval: function(msg, room) {
        try {
            var result = eval(msg.slice(4).trim());
            this.talk(room, '<<<< ' + JSON.stringify(result));
        }
        catch (e) {
            this.talk(room, '<<<< ' + e.name + ": " + e.message);
        }
    },
    roomIsBanned: function(room) {
        var willNotJoin = fs.readFileSync('data/bannedrooms.txt').toString().split('\n');
        if (willNotJoin.indexOf(room) > -1) {
            return true;
        }
        else {
            return false;
        }
    },
    ResourceMonitor: function(message, by, room, type) {
        if (!Parse.settings[config.serverid][toId(config.nick)].monitor) {
            Parse.settings[config.serverid][toId(config.nick)].monitor = {};
        }
        if (Parse.settings[config.serverid][toId(config.nick)].monitor[room]) return false;
        if (this.isBanned(by) || this.isDev(by)) return false;
        if (toId(by) === toId(config.nick)) return;
        if (config.commandcharacter.indexOf(message.charAt(0)) === -1 && room.charAt(0) !== ',') return;
        var user = toId(by);
        if (!this.monitor.user[user]) {
            this.monitor.user[user] = {}
            this.monitor.user[user].count = 0;
            this.monitor.user[user].command = {};
        }
        if (config.commandcharacter.indexOf(message.charAt(0)) !== -1) {
            var temp = message.split(' ')[0].slice(1);
            var command = toId(temp);
            if (['triviaanswer', 'ta', 'guess', 'g', 'gk'].indexOf(command) > -1) return;
            if (Commands[command]) {
                var failsafe = 0
                while (typeof Commands[command] !== "function" && failsafe++ < 10) {
                    command = Commands[command];
                }
                if (!Parse.settings[config.serverid][toId(config.nick)].disable) {
                    Parse.settings[config.serverid][toId(config.nick)].disable = {};
                }
                if (Parse.settings[config.serverid][toId(config.nick)].disable[command]) {
                    return;
                }
                if (!this.monitor.user[user].command[command]) {
                    this.monitor.user[user].command[command] = 0;
                }
                this.monitor.user[user].count++;
                this.monitor.usage++;
                this.monitor.user[user].command[command]++
            }
            var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
            for (var i = 0; i < ccommands.length; i++) {
                var spl = ccommands[i].split('|')
                if (room === spl[2] && command === spl[3] && config.serverid === spl[0] && toId(config.nick) === spl[1]) {
                    if (!this.monitor.user[user].command.customcommand) {
                        this.monitor.user[user].command.customcommand = 0;
                    }
                    this.monitor.user[user].command.customcommand++
                        this.monitor.user[user].count++;
                    this.monitor.usage++;
                }
            }
        }
        else {
            if (!this.monitor.user[user].command.pms) {
                this.monitor.user[user].command.pms = 0;
            }
            this.monitor.user[user].command.pms++
        }
        //identify attack patterns
        //catch attacks earlier
        if (this.monitor.pattern[0] && this.monitor.user[user].command) {
            for (var com in this.monitor.user[user].command) {
                if (this.monitor.user[user].command[com] > MONITOR.PREVENTION && this.monitor.pattern.indexOf(com) > -1) {
                    if (!this.monitor.warnings[user]) {
                        this.monitor.warnings[user] = 0;
                    }
                    this.monitor.warnings[user]++;
                    if (this.monitor.warnings[user] <= 5) {
                        this.mute(user, MONITOR.WARNING[this.monitor.warnings[user]])
                    }
                    else {
                        fs.appendFile('data/commandban.txt', user + '\n')
                    }
                    this.monitor.pattern.push(com);
                    setTimeout(function() {
                        this.monitor.pattern = this.monitor.pattern.slice(1);
                    }.bind(this), 30 * 60 * 1000)
                    monitor(user + ' was intercepted for abuse of ' + com + ' (' + this.monitor.warnings[user] + ')')
                    cleanBuffer(user);
                    return;
                }
            }
        }
        //moderation for excess
        //per user basis
        if (this.monitor.user[user].count > MONITOR.USER) {
            if (!this.monitor.warnings[user]) {
                this.monitor.warnings[user] = 0;
            }
            this.monitor.warnings[user]++;
            if (this.monitor.warnings[user] <= 5) {
                this.mute(user, MONITOR.WARNING[this.monitor.warnings[user]])
            }
            else {
                fs.appendFile('data/commandban.txt', user + '\n')
            }
            cleanBuffer(user)
            monitor(user + ' was moderated for spamming commands (' + this.monitor.warnings[user] + ')')

            //parse patterns of spamming... Hard to identify users who go from command to command.
            var abused = [];
            for (var command in this.monitor.user[user].command) {
                if (this.monitor.user[user].command[command] >= MONITOR.COMMAX) {
                    abused.push(command)
                }

            }
            if (abused[0]) {
                for (var i = 0; i < abused.length; i++) {
                    this.monitor.pattern.push(abused[i]);
                    setTimeout(function() {
                        this.monitor.pattern = this.monitor.pattern.slice(1);
                    }.bind(this), 30 * 60 * 1000)
                }
            }
        }
        //parse many accounts attacking slowly
        //multiple people spammimg?
        if (this.monitor.usage > MONITOR.TOTAL) {
            monitor(user + this.monitor.usage + ' commands was used in one minute.')
                //names of all the users
            var names = [];
            for (var name in this.monitor.user) {
                names.push(name);
                if (!this.monitor.repeat[user]) {
                    this.monitor.repeat[user]++
                }
                this.monitor.repeat[user]++;
            }
            //try to purge repeat offenders
            for (var username in this.monitor.repeat) {
                if (this.monitor.repeat[username] > 5) {
                    if (!this.monitor.warnings[user]) {
                        this.monitor.warnings[user] = 0;
                    }
                    this.monitor.warnings[user]++
                        this.monitor.repeat[user] = 0;
                    cleanBuffer(user)
                    if (this.monitor.warnings[user] <= 5) {
                        this.mute(user, MONITOR.WARNING[this.monitor.warnings[user]])
                    }
                    else {
                        fs.appendFile('data/commandban.txt', user + '\n')
                    }
                }
            }
            //quickly get rid of some higher numbers
            var average = this.monitor.usage / names.length;
            for (var name in this.monitor.user) {
                //target the most common ones
                if (this.monitor.user[user].count >= average) {
                    //9 seconds to clear buffer
                    cleanBuffer(user)
                    this.mute(name, 0.15);
                }
            }
            this.monitor.usage = 0;
        }
    },
    talk: function(room, message) {
        this.say(config.nick, room, message, true);
    },
    say: function(user, room, text, bypass) {
        user = toId(user);
        if (!Parse.settings[config.serverid][toId(config.nick)].translation) {
            Parse.settings[config.serverid][toId(config.nick)].translation = {}
        }

        if (!bypass && Parse.settings[config.serverid][toId(config.nick)].translation[room] !== 'en' && Parse.settings[config.serverid][toId(config.nick)].translation[room] && room.charAt(0) !== ',' && text.indexOf('/me') !== 0) {
            var parts = ''
            if (text.charAt(0) === '/' && text.charAt(1) !== '/' && text.indexOf('/me') !== 0) {
                parts = text.split(',')[0];
                text = text.split(',').slice(1).join(',')
            }
            Tools.translate(room, parts, text, 'en', Parse.settings[config.serverid][toId(config.nick)].translation[room]);
            return;
        }
        if (!text) return;
        //
        if (room.charAt(0) !== ',') {
            var str = (room !== 'lobby' ? room : '') + '|' + text;
        }
        else {
            room = room.substr(1);
            var str = '|/pm ' + room + ', ' + text;
        }
        send(str, user);
    },
    haveRank: function(user, rank) {
        var hasRank = (rank.split('').indexOf(user.charAt(0)) !== -1) || (config.excepts.indexOf(toId(user)) !== -1);
        return hasRank;
    },
    canUse: function(cmd, room, user) {
        var canUse = false;
        var ranks = ' +★$%@&#~';
        if (!Parse.settings[config.serverid][toId(config.nick)][cmd] || !Parse.settings[config.serverid][toId(config.nick)][cmd][room]) {
            canUse = this.hasRank(user, ranks.substr(ranks.indexOf((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank)));
        }
        else if (Parse.settings[config.serverid][toId(config.nick)][cmd][room] === true) {
            canUse = true;
        }
        else if (ranks.indexOf(Parse.settings[config.serverid][toId(config.nick)][cmd][room]) > -1) {
            canUse = this.hasRank(user, ranks.substr(ranks.indexOf(Parse.settings[config.serverid][toId(config.nick)][cmd][room])));
        }
        return canUse;
    },
    	/*
	alts: 'profile',
	profile: function(arg, by, room, cmd) {
		var destination = ',' + by;
		var user = toId(by);
		if (!arg || !Bot.rankFrom(by, '+')) {
			arg = user;
		}
		else {
			arg = toId(arg);
		}
		if (cmd === 'alts') {
			Tools.uploadToHastebin('User: ' + arg + '\nAlts: ' + (this.profiles[arg] ? this.profiles[arg].join(', ') : arg), function(link) {
				Bot.say(by, destination, link);
			}.bind(this))
		}
		else {
			//get all the alts
			var userData = this.profiles[arg] || [arg];
			var data = {};
			//create data object
			for (var i = 0; i < userData.length; i++) {
				data[userData[i]] = {
					blacklist: [],
					rank: Bot.botRank(userData[i])
				};
			}
			//check blacklist records
			for (var user in data) {
				for (var server in this.settings) {
					for (var nick in this.settings[server]) {
						for (var room in this.settings[server][nick].blacklist) {
							if (this.settings[server][nick].blacklist[room][user]) {
								data[user].blacklist.push('[' + server + '] ' + room);
							}
						}
					}
				}
			}
			//create table
			var table = ['User: ' + arg, 'BotRank: ' + Bot.botRank(arg), '', '+--------------------+-------+--------------------------------+--------------+', '|Alt:                |BotRank|Blacklist Records               |BotBan/BotMute|', '+--------------------+-------+--------------------------------+--------------+']; //19 + 7 + 32
			for (var name in data) {
				//determine number of rows
				var rows = data[name].blacklist.length || 1;
				table.push('|' + name + '                    '.slice(name.length) + '|' + Bot.botRank(name) + '      |' + (data[name].blacklist[0] ? data[name].blacklist[0] : '') + (data[name].blacklist[0] ? '                                '.slice(data[name].blacklist[0].length) : '                                ') + '|' + (Bot.isBanned(name) ? '  X           |' : '              |'))
				for (var i = 1; i < rows; i++) {
					table.push('|                    |       |' + (data[name].blacklist[i] ? data[name].blacklist[i] : '') + (data[name].blacklist[i] ? '                                '.slice(data[name].blacklist[i].length) : '                           ') + '|              |')
				}
				table.push('+--------------------+-------+--------------------------------+--------------+');
			}
			Tools.uploadToHastebin(table.join('\n'), function(link) {
				Bot.say(by, destination, link);
			}.bind(this))
		}
	},*/
}