exports.commands = {
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function(arg, by, room) {
		if (!Bot.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) return Bot.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return Bot.say(by, room, 'You must specify at least one user to blacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.blacklistUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			Bot.say(config.nick, room, '/roomban ' + tarUser + ', Blacklisted user');
			Bot.say(config.nick, room, '/modnote ' + tarUser + ' was added to the blacklist by ' + by + '.');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
			Tools.writeSettings();
		}
		if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
		if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
		Bot.say(by, room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function(arg, by, room) {
		if (!Bot.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) return Bot.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return Bot.say(by, room, 'You must specify at least one user to unblacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unblacklistUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			Bot.say(config.nick, room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
			Tools.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
		Bot.say(by, room, text);
	},
	rab: 'regexautoban',
	regexautoban: function(arg, by, room) {
		if (!Bot.rankFrom(by, '~') || !Bot.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) return Bot.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return Bot.say(by, room, 'You must specify a regular expression to (un)blacklist.');

		try {
			new RegExp(arg, 'i');
		}
		catch (e) {
			return Bot.say(by, room, e.message);
		}

		arg = '/' + arg + '/i';
		if (!this.blacklistUser(arg, room)) return Bot.say(by, room, '/' + arg + ' is already present in the blacklist.');

		Tools.writeSettings();
		Bot.say(by, room, '/' + arg + ' was added to the blacklist successfully.');
	},
	unrab: 'unregexautoban',
	unregexautoban: function(arg, by, room) {
		if (!Bot.rankFrom(by, '~') || !Bot.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) return Bot.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return Bot.say(by, room, 'You must specify a regular expression to (un)blacklist.');

		arg = '/' + arg.replace(/\\\\/g, '\\') + '/i';
		if (!this.unblacklistUser(arg, room)) return Bot.say(by, room, '/' + arg + ' is not present in the blacklist.');

		Tools.writeSettings();
		Bot.say(by, room, '/' + arg + ' was removed from the blacklist successfully.');
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function(arg, by, room) {
		if (!Bot.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings[config.serverid][toId(config.nick)].blacklist || !this.settings[config.serverid][toId(config.nick)].blacklist[room]) {
			text = 'No users are blacklisted in this room.';
		}
		else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Invalid nickname: "' + nick + '".';
				}
				else {
					text = 'User "' + nick + '" is currently ' + (nick in this.settings[config.serverid][toId(config.nick)].blacklist[room] ? '' : 'not ') + 'blacklisted in ' + room + '.';
				}
			}
			else {
				var nickList = Object.keys(this.settings[config.serverid][toId(config.nick)].blacklist[room]);
				if (!nickList.length) return Bot.say(by, room, '/pm ' + by + ', No users are blacklisted in this room.');
				Tools.uploadToHastebin('The following users are banned in ' + room + ':\n\n' + nickList.join('\n'), function(link) {
					Bot.say(by, room, "/pm " + by + ", Blacklist for room " + this.rooms[room].name + ": " + link);
				}.bind(this));
				return;
			}
		}
		Bot.say(by, room, '/pm ' + by + ', ' + text);
	},
	banphrase: 'banword',
	banword: function(arg, by, room) {
		if (!Bot.canUse('banword', room, by)) return false;
		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases) this.settings[config.serverid][toId(config.nick)].bannedphrases = {};
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!Bot.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] = {};
		if (arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) return Bot.say(by, room, "Phrase \"" + arg + "\" is already banned.");
		this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom][arg] = 1;
		Tools.writeSettings();
		Bot.say(by, room, "Phrase \"" + arg + "\" is now banned.");
	},
	unbanphrase: 'unbanword',
	unbanword: function(arg, by, room) {
		if (!Bot.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!Bot.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases || !this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] || !(arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]))
			return Bot.say(by, room, "Phrase \"" + arg + "\" is not currently banned.");
		delete this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom][arg];
		if (!Object.size(this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom])) delete this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom];
		if (!Object.size(this.settings[config.serverid][toId(config.nick)].bannedphrases)) delete this.settings[config.serverid][toId(config.nick)].bannedphrases;
		Tools.writeSettings();
		Bot.say(by, room, "Phrase \"" + arg + "\" is no longer banned.");
	},
	viewbannedphrases: 'viewbannedwords',
	vbw: 'viewbannedwords',
	viewbannedwords: function(arg, by, room) {
		if (!Bot.canUse('viewbannedwords', room, by)) return false;
		arg = arg.trim().toLowerCase();
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!Bot.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		var text = "";
		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases || !this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) {
			text = "No phrases are banned in this room.";
		}
		else {
			if (arg.length) {
				text = "The phrase \"" + arg + "\" is currently " + (arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] ? "" : "not ") + "banned " +
					(room.charAt(0) === ',' ? "globally" : "in " + room) + ".";
			}
			else {
				var banList = Object.keys(this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]);
				if (!banList.length) return Bot.say(by, room, "No phrases are banned in this room.");
				Tools.uploadToHastebin("The following phrases are banned " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ":\n\n" + banList.join('\n'), function(link) {
					Bot.say(by, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + "Banned Phrases " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ": " + link);
				}.bind(this));
				return;
			}
		}
		Bot.say(by, room, text);
	},
	setemotemod: 'emotemoderation',
	emotemod: 'emotemoderation',
	emotemoderation: function(arg, by, room) {
		if (!Bot.hasRank(by, '%@&#~')) return false;
		var noModeration = fs.readFileSync('data/emotemoderation.txt').toString().split('\n');
		if (!arg) return Bot.say(by, room, 'Moderation for emoticons is ' + (noModeration.indexOf('d|' + room) > -1 ? 'OFF.' : 'ON.'));
		if (!Bot.hasRank(by, '#~')) return false;
		switch (toId(arg)) {
			case 'on':
				if (noModeration.indexOf('d|' + room) > -1) {
					noModeration[noModeration.indexOf('d|' + room)] = 'n|' + room;
				}
				fs.writeFileSync('data/emotemoderation.txt', noModeration.join('\n'));
				Bot.say(by, room, 'Moderation for emoticons is ON.');
				break;
			case 'off':
				if (noModeration.indexOf('n|' + room) > -1) {
					noModeration[noModeration.indexOf('n|' + room)] = 'd|' + room;
				}
				else if (noModeration.indexOf('d|' + room) === -1) {
					noModeration.push('d|' + room);
				}
				fs.writeFileSync('data/emotemoderation.txt', noModeration.join('\n'));
				Bot.say(by, room, 'Moderation for emoticons is OFF.');
				break;
			default:
				return Bot.say(by, room, 'The params for this is on/off');
		}
	},
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals fs */
/* globals Tools */
