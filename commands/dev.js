exports.commands = {
	reloadtiers: function(arg, by, room) {
		if (!Bot.isDev(by)) return false;
		var self = this;
		var link = 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js';
		https.get(link, function(res) {
			var data = '';
			res.on('data', function(part) {
				data += part;
			});
			res.on('end', function(end) {
				fs.writeFileSync('battle/pokemonData.js', data);
				self.say(by, room, 'Reloaded Pokemon Data.');
			});
		});
	},
	state: 'toggle',
	toggle: function(arg, by, room, cmd) {
		if (!Bot.rankFrom(by, '~')) return false;
		var matchUp = {
			false: true,
			true: false
		};
		var command = toId(arg.split(',')[0]);
		//need to get to the bottom of the command
		var failsafe = 0;
		if (!Commands[command]) {
			return false;
		}
		while (typeof Commands[command] !== "function" && failsafe++ < 10) {
			command = Commands[command];
		}
		var state = (this.settings[config.serverid][toId(config.nick)].disable[command] ? this.settings[config.serverid][toId(config.nick)].disable[command] : false);
		if (cmd === 'state') {
			return Bot.say(by, room, command + ' is ' + (state ? 'disabled' : 'enabled'));
		}
		var setState = matchUp[state];
		this.settings[config.serverid][toId(config.nick)].disable[command] = setState;
		Tools.writeSettings();
		Bot.say(by, room, command + ' was ' + (setState ? 'disabled.' : 'enabled.'));
	},
	reloadrooms: function(arg, by, room) {
		if (!Bot.rankFrom(by, '~')) return false;
		config.rooms = [];
		for (var tarRoom in this.rooms) {
			if (tarRoom.indexOf('battle-') === 0 || tarRoom.indexOf('groupchat-') === 0) {
				continue;
			}
			config.rooms.push(tarRoom);
		}
		fs.writeFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json', JSON.stringify(config.rooms));
		Bot.say(by, room, 'Reloaded save file for config.rooms.');
	},

	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */
	joinroom: function(arg, by, room) {
		if (room.charAt(0) !== ',') return false;
		send('|/join ' + arg);
	},
	reload: function(arg, by, room) {
		if (!Bot.isDev(by)) return false;
		try {
			Bot.reload();
			Bot.say(by, room, 'Commands reloaded.');
			ok('Commands reloaded.');
		}
		catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	git: function(arg, by, room) {
		if (!Bot.hasRank(by, '&#~')) room = ',' + by;
		return Bot.say(by, room, 'https://github.com/sparkychild/ChuChuBoTTT', true);
	},
	c: 'custom',
	custom: function(arg, by, room) {
		if (config.excepts.indexOf(toId(by)) === -1 && !Bot.rankFrom(by, '~')) return false;
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		Bot.talk(tarRoom || room, arg);
		// Custom commands can be executed in an arbitrary room using the syntax
		// ".custom [room] command", e.g., to do !data pikachu in the room lobby,
		// the command would be ".custom [lobby] !data pikachu". However, using
		// "[" and "]" in the custom command to be executed can mess this up, so
		// be careful with them.
	},
	restart: function(arg, by, room) {
		if (!Bot.rankFrom(by, '~')) return false;
		for (var tarRoom in triviaON) {
			if (triviaON[tarRoom]) {
				return Bot.say(by, room, 'Trivia game going on.');
			}
		}
		for (var tarRoom in hangmanON) {
			if (hangmanON[tarRoom]) {
				return Bot.say(by, room, 'Hangman game going on.');
			}
		}
		for (var tarRoom in anagramON) {
			if (anagramON[tarRoom]) {
				return Bot.say(by, room, 'Anagram game going on.');
			}
		}
		for (var tarRoom in gameStatus) {
			if (gameStatus[tarRoom] !== 'off') {
				return Bot.say(by, room, 'Blackjack game going on.');
			}
		}
		for (var tarRoom in crazyeight.gameStatus) {
			if (crazyeight.gameStatus[tarRoom] !== 'off') {
				return Bot.say(by, room, 'C8 game going on.');
			}
		}
		if (Object.keys(kunc.on).length !== 0) {
			return Bot.say(by, room, 'Kunc game going on.');
		}
		process.exit(-1);
	},
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals Tools */
/* globals Commands */
/* globals fs */
/* globals kunc*/
/* globals crazyeight */
/* globals anagramON */
/* globals gameStatus */
/* globals hangmanON */
/* globals triviaON */
/* globals error */
/* globals ok */
/* globals sys */
/* globals send */
/* globals https */
