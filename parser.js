/**
 * This is the file where commands get parsed
 *
 * Some parts of this code are taken from the Pokémon Shfowdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */
//grants DEV access to the bot: the bot itself should be kept on here so it can moderate itself; leave sparkychild here in case you need help.

var pmUser = [toId(config.nick)];

var emoticonAbuse = {};
var emoteFlooding = {};

var initChallstr = [];
var forceRenamed = false;

var sys = require('sys');
var https = require('https');
var http = require('http');
var url = require('url');

const ACTION_COOLDOWN = 3 * 1000;
const FLOOD_MESSAGE_NUM = 5;
const FLOOD_PER_MSG_MIN = 500; // this is the minimum time between messages for legitimate spam. It's used to determine what "flooding" is caused by lag
const FLOOD_MESSAGE_TIME = 6 * 1000;
const MIN_CAPS_LENGTH = 12;
const MIN_CAPS_PROPORTION = 0.8;

if (!fs.existsSync('settings.json')) {
	fs.writeFileSync('settings.json', '{}');
}

var settings;
try {
	settings = JSON.parse(fs.readFileSync('settings.json'));
}
catch (e) {
	error('Unable to load settings file.')
	process.exit(-1);
} // file doesn't exist [yet]

if (!Object.isObject(settings)) settings = {};
/*
var profiles;
try {
	profiles = JSON.parse(fs.readFileSync('profiles.json'));
}
catch (e) {} // file doesn't exist [yet]

if (!Object.isObject(profiles)) profiles = {};
*/


exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	'settings': settings,
	//'profiles': profiles,
	blacklistRegexes: {},
	chatData: {},
	rooms: {},
	data: function(data) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0, len = data.length; i < len; i++) {
					this.splitMessage(data[i]);
				}
			}
			else {
				this.splitMessage(data);
			}
		}
	},
	splitMessage: function(message) {
		if (!message) return;
		var changes = false;
		if (!this.settings[config.serverid]) {
			this.settings[config.serverid] = {};
			info('Created subsettings: serverid')
			changes = true;
		}
		if (!this.settings[config.serverid][toId(config.nick)]) {
			this.settings[config.serverid][toId(config.nick)] = {};
			info('Created subsettings: nick');
			changes = true;
		}
		if (changes) {
			Tools.writeSettings();
		}
		var room = 'lobby';
		if (message.indexOf('\n') < 0) return this.message(message, room);

		var spl = message.split('\n|:|')[0].split('\n');
		/*
		if (spl[0].charAt(0) === '>') {
			if (spl[1].substr(1, 10) === 'tournament') return;
			room = spl.shift().substr(1);
			if (spl[0].substr(1, 4) === 'init') {
				var users = spl[2].substr(7).split(',');
				var nickId = toId(config.nick);
				for (var i = users.length; i--;) {
					if (toId(users[i]) === nickId) {
						Bot.ranks[room] = users[i].trim().charAt(0);
						break;
					}
				}
				return ok('joined ' + room);
			}
		}*/
		if (spl[0].charAt(0) === '>') {
			room = spl.shift().substr(1);
		}
		for (var i = 0, len = spl.length; i < len; i++) {
			this.message(spl[i], room);
		}
	},
	message: function(message, room) {
		Battle.receive(message, room);
		var spl = message.split('|');
		switch (spl[1]) {
			case 'init':
				if (!this.rooms[room]) {
					this.rooms[room] = this.rooms[room] || {
						name: null,
						users: {}
					};
				}
				break;
			case 'nametaken':
			case 'challstr':
				if (spl[1] === 'challstr') {
					Commands.clearstatus.call(this, '', config.nick, '');
				}
				if (spl[1] === 'challstr') {
					initChallstr = spl
				}
				else {
					spl = initChallstr;
					forceRenamed = true;
				}

				info('received challstr, logging in...');
				var id = spl[2];
				var str = spl[3];

				var requestOptions = {
					hostname: this.actionUrl.hostname,
					port: this.actionUrl.port,
					path: this.actionUrl.pathname,
					agent: false
				};

				if (!config.pass) {
					requestOptions.method = 'GET';
					requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
				}
				else {
					requestOptions.method = 'POST';
					var data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
					requestOptions.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': data.length
					};
				}

				var req = https.request(requestOptions, function(res) {
					res.setEncoding('utf8');
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						if (data === ';') {
							error('failed to log in; nick is registered - invalid or no password given');
							process.exit(-1);
						}
						if (data.length < 50) {
							error('failed to log in: ' + data);
							process.exit(-1);
						}

						if (data.indexOf('heavy load') !== -1) {
							error('the login server is under heavy load; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60 * 1000);
							return;
						}

						if (data.substr(0, 16) === '<!DOCTYPE html>') {
							error('Connection error 522; trying agian in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60 * 1000);
							return;
						}

						try {
							data = JSON.parse(data.substr(1));
							if (data.actionsuccess) {
								data = data.assertion;
							}
							else {
								error('could not log in; action was not successful: ' + JSON.stringify(data));
								process.exit(-1);
							}
						}
						catch (e) {}
						send('|/trn ' + config.nick + ',0,' + data);
					}.bind(this));
				}.bind(this));

				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
				});

				if (data) req.write(data);
				req.end();
				break;
			case 'updateuser':
				if (spl[2] !== config.nick) return;

				if (forceRenamed) {
					forceRenamed = false;
					return;
				}

				if (spl[3] !== '1') {
					error('failed to log in, still guest');
					process.exit(-1);
				}

				ok('logged in as ' + spl[2]);

				// Now join the rooms
				if (config.avatar) {
					send('|/avatar ' + config.avatar);
				}
				for (var i = 0, len = config.rooms.length; i < len; i++) {
					var room = toId(config.rooms[i]);
					if(this.rooms[room]) continue;
					send('|/join ' + room);
				}
				try {
					if (this.settings[config.serverid][toId(config.nick)].blacklist) {
						var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist;
						for (var room in blacklist) {
							this.updateBlacklistRegex(room);
						}
					}
				}
				catch (e) {
					error('Blacklists not loaded..')
				}
				setInterval(this.cleanChatData.bind(this), 30 * 60 * 1000);
				Bot.initMonitor();
				break;
			case 'c':
				var by = spl[2];
				spl = spl.slice(3).join('|');
				if (Bot.roomIsBanned(room)) return Bot.talk(room, '/leave', true);
				if (this.isBlacklisted(toId(by), room)) return Bot.talk(room, '/roomban ' + by + ', Blacklisted user', true);
				if (!Bot.hasRank(by, '%@&#~')) {
					this.processChatData(toId(by), room, spl);
				}
				else {
					this.updateSeen(toId(by), 'c', room);
				}
				if (toId(by) === toId(config.nick)) {
					Bot.ranks[room] = by.charAt(0);
				}
				this.chatMessage(spl, by, room);
				Plugins.mailUser(by, room);
				break;
			case 'c:':
				var by = spl[3];
				spl = spl.slice(4).join('|');
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (Bot.roomIsBanned(room)) return Bot.talk(room, '/leave', true);
				if (this.isBlacklisted(toId(by), room)) return Bot.talk(room, '/roomban ' + by + ', Blacklisted user', true);
				if (!Bot.hasRank(by, '%@&#~')) {
					this.processChatData(toId(by), room, spl);
				}
				else {
					this.updateSeen(toId(by), 'c', room);
				}
				this.updateSeen(by, spl[1], room);
				if (toId(by) === toId(config.nick)) {
					Bot.ranks[room] = by.charAt(0);
				}
				if (Bot.isDev(by) && spl.slice(0, 4) === '>>>>') {
					Bot.eval(spl, room);
				}
				this.chatMessage(spl, by, room);
				Plugins.mailUser(by, room);
				break;
			case 'pm':
				var by = spl[2];
				this.chatMessage(spl.slice(4).join('|'), by, ',' + by);
				if (Bot.isDev(by) && spl.slice(4).join('|').slice(0, 4) === '>>>>') {
					Bot.eval(spl.slice(4).join('|'), ',' + by);
				}
				if (pmUser.indexOf(toId(by)) === -1 && config.commandcharacter.indexOf(spl.slice(4).join('|').charAt(0)) === -1 && spl.slice(4).join('|').indexOf('/invite') !== 0 && spl.slice(4).join('|').indexOf('>>>>') !== 0) {
					Bot.talk(',' + by, config.pmmessage);
					pmUser.push(toId(by));
				}

				break;
			case 'N':
				var by = spl[2];
				delete this.rooms[room].users[toId(spl[3])];
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (toId(by) === toId(config.nick)) {
					Bot.ranks[room] = by.charAt(0);
				}
				if (this.isBlacklisted(toId(by), room)) return Bot.talk(room, '/roomban ' + by + ', Blacklisted user');
				this.updateSeen(spl[3], spl[1], toId(by));
				Bot.botBanTransfer(by, spl[3]);
				/*
				if(config.alts){
					this.updateProfile(by, room, spl[3]);
				}*/
				Plugins.mailUser(by, room);
				break;
			case 'J':
			case 'j':
				var by = spl[2];
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (config.rooms.indexOf(room) === -1 && room.substr(0, 7) !== 'battle-' && room.substr(0, 10) !== 'groupchat-') {
					config.rooms.push(room);
					fs.writeFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json', JSON.stringify(config.rooms));
				}
				if (Bot.roomIsBanned(room)) return Bot.talk(room, '/leave');
				if (toId(by) === toId(config.nick)) {
					Bot.ranks[room] = by.charAt(0);
				}
				if (this.isBlacklisted(toId(by), room)) return Bot.talk(room, '/roomban ' + by + ', Blacklisted user');
				Plugins.autorank(by, room);
				Plugins.joinMessages(room, by);
				this.updateSeen(toId(by), spl[1], room);
				Plugins.mailUser(by, room);
				break;
			case 'l':
			case 'L':
				this.updateSeen(toId(spl[2]), spl[1], room);
				delete this.rooms[room].users[toId(spl[2])];
				break;
			case 'raw':
				this.parseEmotes(spl[2], room);
				break;
			case 'users':
				var userList = spl[2].split(',').slice(1);
				for (var i = 0; i < userList.length; i++) {
					this.rooms[room].users[toId(userList[i])] = userList[i].charAt(0);
					if (toId(userList[i]) === toId(config.nick)) {
						Bot.ranks[room] = userList[i].charAt(0);
					}
				}
				break;
			case 'title':
				if (spl[2].indexOf(config.nick + ' vs. ') == 0 || spl[2].indexOf('vs. ' + config.nick) > -1) {
					break;
				}
				join(spl[2]);
				this.rooms[room].name = spl[2];
				break;
			case 'popup':
				this.parseTransfer(spl.slice(2).join('|'))
				break;
			case 'deinit':
				if (room.substr(0, 7) !== 'battle-') {
					leave(room);
				}
				delete this.rooms[room];
				delete Bot.ranks[room];
				Commands.resetroom.call(this, '', config.nick, room);
				break;
			case 'updatechallenges':
				var challengeData = JSON.parse(spl[2]).challengesFrom;
				var players = Object.keys(challengeData);
				Battle.accept(players[0], challengeData[players[0]])
				break;
			case 'tournament':
				Battle.tournaments(spl.slice(2), room);
				break;
		}
	},
	parseTransfer: function(text) {
		if (toId(config.nick) !== 'sparkybottt') return;
		if (text.split(' has transferred ').length < 2) return;
		var user = text.split(' has transferred ')[0];
		var amount = text.split(' has transferred ')[1].split(' buck')[0] * 1;
		if (typeof amount !== 'number') {
			if (text.split(' has transferred ').length < 3) return;
			user += ' has transferred ';
			amount = text.split(' has transferred')[2].split(' buck')[0] * 1
		}
		info(user + ' has transfered ' + amount + 'bucks');
	},
	/*
	updateProfile: function(by, room, oldname) {
		if (!by || !oldname || !room || !config.alts) return;
		var user = toId(by);
		oldname = toId(oldname);
		if (this.profiles[user] && this.profiles[oldname]) {
			if (this.profiles[user].indexOf(oldname) > -1 && this.profiles[oldname].indexOf(user) > -1) {
				return;
			}
		}
		if (user === oldname) {
			return;
		}
		var profile = this.profiles;
		if (!profile[user]) {
			profile[user] = [user];
		}
		var alts = profile[user];
		if (alts.indexOf(oldname) === -1) {
			alts.push(oldname);
		}
		//compile FULL alt list
		for (var i = 0; i < alts.length; i++) {
			//safety catch
			if (!profile[alts[i]]) {
				profile[alts[i]] = [alts[i]];
			}
			//gather full alts list
			if (profile[alts[i]].length > 0) {
				for (var j = 0; j < profile[alts[i]].length; j++) {
					if (alts.indexOf(profile[alts[i]][j]) > -1) {
						continue;
					}
					if (!profile[alts[i]][j]) {
						continue;
					}
					alts.push(profile[alts[i]][j]);
				}
			}
		}
		//syncronize alts
		for (i = 0; i < alts.length; i++) {
			profile[alts[i]] = alts;
		}
		this.profiles = profile;
		fs.writeFileSync('profiles.json', JSON.stringify(profile))
	},
	*/
	parseEmotes: function(html, room) {

		if (html.indexOf('<div class=\'chat\'><small>') !== 0) return false;
		var emoteList = ["#freewolf", "feelsbd", "feelsbn", "feelspn", "feelsdd", "feelsgd", "feelsgn", "feelsmd", "feelsnv", "feelsok", "feelspika", "feelspink", "feelsrs", "feelssc", "fukya", "funnylol", "hmmface", "Kappa", "noface", "Obama", "oshet", "PJSalt", "trumpW", "Sanic", "wtfman", "xaa", "yayface", "yesface", "meGusta", "trollface", "Doge"];
		var initialLength = html.length;
		var usersearch = html.indexOf('</small><button name=\'parseCommand\' value=\'/user ') + 49

		var user = html.slice(usersearch).split('\' style=\'background:none;border:0;padding:0 5px 0 0;font-family:Verdana,Helvetica,Arial,sans-serif;font-size:9pt;cursor:pointer\'><b><font color=')[0];


		if (toId(user) === toId(config.nick)) return false;
		var emoteCount = 0;

		var emoteStats = {};

		for (var j = 0; j < emoteList.length; j++) {
			var replacer = '" title="' + emoteList[j] + '" />';
			var newText = '';
			emoteStats[emoteList[j]] = 0;
			for (var i = 0; i < ~~(initialLength / replacer.length) + 1; i++) {
				if (html.indexOf(replacer) === -1) {
					break;
				}
				emoteStats[emoteList[j]]++;
				html = html.replace(replacer, '');
				emoteCount++;
			}
		}

		//parse flooding
		if (emoteStats) {
			if (!emoteFlooding[toId(user)]) {
				emoteFlooding[toId(user)] = 0;
			}
			emoteFlooding[toId(user)]++
				setTimeout(function() {
					emoteFlooding[toId(user)]--
				}.bind(this), FLOOD_MESSAGE_TIME);
			if (emoteFlooding[toId(user)] >= FLOOD_MESSAGE_NUM) {
				emoteCount = emoteFlooding[toId(user)];
			}
		}
		//data logging
		Plugins.emoteCount(emoteStats);
		//moderation
		this.emoteModerate(emoteCount, user, room)
	},
	emoteModerate: function(count, user, room) {
		if (Bot.rankFrom(user, '+')) return false;

		if (!emoticonAbuse[toId(user)]) {
			emoticonAbuse[toId(user)] = 0
		}
		if (count < 3) return false;
		if (count > 2) {
			emoticonAbuse[toId(user)] = emoticonAbuse[toId(user)] + count;
		}

		var noModeration = fs.readFileSync('data/emotemoderation.txt').toString().split('\n');
		if (noModeration.indexOf('d|' + room) > -1) {
			return false;
		}


		if (count > 15) {
			if (Bot.hasRank(Bot.ranks[room], '@#&~')) {
				return Bot.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (Bot.hasRank(Bot.ranks[room], '%')) {
				return Bot.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		//

		if (emoticonAbuse[toId(user)] > 150) {
			if (Bot.hasRank(Bot.ranks[room], '@#&~')) {
				return Bot.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (Bot.hasRank(Bot.ranks[room], '%')) {
				return Bot.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 50 && emoticonAbuse[toId(user)] < 151) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/hourmute ' + user + ', Please do not spam emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 6 && emoticonAbuse[toId(user)] < 51) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/mute ' + user + ', Please do not abuse emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 2 && emoticonAbuse[toId(user)] < 7) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/warn ' + user + ', Please use emoticons in moderation. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
	},
	chatMessage: function(message, by, room) {
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0, 8) === '/invite ' && Bot.hasRank(by, '+%@&~') && !Bot.roomIsBanned(message.substr(8))) {
			invite(by, message.substr(8));
			Bot.talk('', '/join ' + message.substr(8));
		}

		if (Bot.isBanned(by)) return false;

		Bot.ResourceMonitor(message, by, room, 'command');

		if (Bot.isBanned(by)) return false;

		Plugins.autoRes(message, by, room);

		//check for command char
		var isCommand = 0;
		for (var c = 0; c < config.commandcharacter.length; c++) {
			if (message.indexOf(config.commandcharacter[c]) === 0) {
				isCommand = config.commandcharacter[c].length;
			}
		}

		if (isCommand === 0 || toId(by) === toId(config.nick)) return;

		Plugins.customCommands('+' + message.slice(isCommand), by, room);

		message = message.slice(isCommand);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = toId(message.substr(0, index));
			arg = message.substr(index + 1).trim();
		}
		else {
			var cmd = toId(message);
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			var leCommand = cmd;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				if (!this.settings[config.serverid][toId(config.nick)].disable) {
					this.settings[config.serverid][toId(config.nick)].disable = {};
				}
				if (this.settings[config.serverid][toId(config.nick)].disable[cmd] && !Bot.isDev(by)) {
					return;
				}
				cmdr(cmdrMessage);
				try {
					Commands[cmd].call(this, arg, by, room, leCommand);
				}
				catch (e) {
					Bot.talk(room, 'The command failed! :o');
					error(sys.inspect(e).toString().split('\n').join(' '))
					if (config.debuglevel <= 3) {
						console.log(e.stack);
					}
				}
			}
			else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	isBlacklisted: function(user, room) {
		var blacklistRegex = this.blacklistRegexes[room];
		return blacklistRegex && blacklistRegex.test(user);
	},
	blacklistUser: function(user, room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist || (this.settings[config.serverid][toId(config.nick)].blacklist = {});
		if (blacklist[room]) {
			if (blacklist[room][user]) return false;
		}
		else {
			blacklist[room] = {};
		}

		blacklist[room][user] = 1;
		this.updateBlacklistRegex(room);
		return true;
	},
	unblacklistUser: function(user, room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist;
		if (!blacklist || !blacklist[room] || !blacklist[room][user]) return false;

		delete blacklist[room][user];
		if (Object.isEmpty(blacklist[room])) {
			delete blacklist[room];
			delete this.blacklistRegexes[room];
		}
		else {
			this.updateBlacklistRegex(room);
		}
		return true;
	},
	updateBlacklistRegex: function(room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist[room];
		var buffer = [];
		for (var entry in blacklist) {
			if (entry.charAt(0) === '/' && entry.substr(-2) === '/i') {
				buffer.push(entry.slice(1, -2));
			}
			else {
				buffer.push('^' + entry + '$');
			}
		}
		this.blacklistRegexes[room] = new RegExp(buffer.join('|'), 'i');
	},
	processChatData: function(user, room, msg) {
		// NOTE: this is still in early stages
		if (!user || room.charAt(0) === ',') return;

		msg = msg.trim().replace(/[ \u0000\u200B-\u200F]+/g, ' '); // removes extra spaces and null characters so messages that should trigger stretching do so
		this.updateSeen(user, 'c', room);
		var now = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: now
		};
		var userData = this.chatData[user];

		if (!this.chatData[user][room]) this.chatData[user][room] = {
			times: [],
			points: 0,
			lastAction: 0
		};
		var roomData = userData[room];

		roomData.times.push(now);
		var by = user;
		user = toId(user);
		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && Bot.hasRank(Bot.ranks[room] || ' ', '%@&#~')) {
			var useDefault = !(this.settings[config.serverid][toId(config.nick)].modding && this.settings[config.serverid][toId(config.nick)].modding[room]);
			var pointVal = 0;
			var muteMessage = '';
			var modSettings = useDefault ? null : this.settings[config.serverid][toId(config.nick)].modding[room];

			// moderation for banned words
			if (!this.settings[config.serverid][toId(config.nick)].banword) {
				this.settings[config.serverid][toId(config.nick)].banword = {};
			}
			if ((useDefault || !this.settings[config.serverid][toId(config.nick)].banword[room]) && pointVal < 2) {
				var bannedPhraseSettings = this.settings[config.serverid][toId(config.nick)].bannedphrases;
				var bannedPhrases = !!bannedPhraseSettings ? (Object.keys(bannedPhraseSettings[room] || {})).concat(Object.keys(bannedPhraseSettings.global || {})) : [];
				for (var i = 0; i < bannedPhrases.length; i++) {
					if (msg.toLowerCase().replace(/(\*\*|\_\_|\~\~|\`\`)/g, '').indexOf(bannedPhrases[i]) > -1) {
						pointVal = 2;
						muteMessage = ', Automated response: your message contained a banned phrase';
						break;
					}
				}
			}
			// moderation for flooding (more than x lines in y seconds)
			var times = roomData.times;
			var timesLen = times.length;
			var isFlooding = (timesLen >= FLOOD_MESSAGE_NUM && (now - times[timesLen - FLOOD_MESSAGE_NUM]) < FLOOD_MESSAGE_TIME && (now - times[timesLen - FLOOD_MESSAGE_NUM]) > (FLOOD_PER_MSG_MIN * FLOOD_MESSAGE_NUM));
			if ((useDefault || !('flooding' in modSettings)) && isFlooding) {
				if (pointVal < 2) {
					pointVal = 2;
					muteMessage = ', Automated response: flooding';
				}
			}
			// moderation for caps (over x% of the letters in a line of y characters are capital)
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			if ((useDefault || !('caps' in modSettings)) && capsMatch && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch.length >= ~~(toId(msg).length * MIN_CAPS_PROPORTION))) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: caps';
				}
			}
			// moderation for stretching (over x consecutive characters in the message are the same)
			var stretchMatch = /(.)\1{7,}/gi.test(msg) || /(..+)\1{4,}/gi.test(msg); // matches the same character (or group of characters) 8 (or 5) or more times in a row
			if ((useDefault || !('stretching' in modSettings)) && stretchMatch) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: stretching';
				}
			}

			if (pointVal > 0 && now - roomData.lastAction >= ACTION_COOLDOWN) {
				var cmd = 'mute';
				// defaults to the next punishment in config.punishVals instead of repeating the same action (so a second warn-worthy
				// offence would result in a mute instead of a warn, and the third an hourmute, etc)
				if (roomData.points >= pointVal && pointVal < 4) {
					roomData.points++;
					cmd = config.punishvals[roomData.points] || cmd;
				}
				else { // if the action hasn't been done before (is worth more points) it will be the one picked
					cmd = config.punishvals[pointVal] || cmd;
					roomData.points = pointVal; // next action will be one level higher than this one (in most cases)
				}
				if (config.privaterooms.indexOf(room) > -1 && cmd === 'warn') cmd = 'mute'; // can't warn in private rooms
				// if the bot has % and not @, it will default to hourmuting as its highest level of punishment instead of roombanning
				if (roomData.points >= 4 && !Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				if (userData.zeroTol > 4) { // if zero tolerance users break a rule they get an instant roomban or hourmute
					muteMessage = ', Automated response: zero tolerance user';
					cmd = Bot.hasRank(Bot.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
				}
				if (roomData.points > 1) userData.zeroTol++; // getting muted or higher increases your zero tolerance level (warns do not)
				roomData.lastAction = now;
				Bot.talk(room, '/' + cmd + ' ' + user + muteMessage);
				//				if(muteMessage = ', Automated response: flooding'){
				//					Bot.talk('TextMonitor', '\[ ' + room + ' | ' + user + ' \] ' + user + ' was muted for flooding in ' + room);
				//				}
			}
		}
	},
	cleanChatData: function() {
		var chatData = this.chatData;
		for (var user in chatData) {
			for (var room in chatData[user]) {
				var roomData = chatData[user][room];
				if (!Object.isObject(roomData)) continue;

				if (!roomData.times || !roomData.times.length) {
					delete chatData[user][room];
					continue;
				}
				var newTimes = [];
				var now = Date.now();
				var times = roomData.times;
				for (var i = 0, len = times.length; i < len; i++) {
					if (now - times[i] < 5 * 1000) newTimes.push(times[i]);
				}
				newTimes.sort(function(a, b) {
					return a - b;
				});
				roomData.times = newTimes;
				if (roomData.points > 0 && roomData.points < 4) roomData.points--;
			}
		}
	},

	updateSeen: function(user, type, detail) {
		if (type !== 'n' && config.rooms.indexOf(detail) === -1 || config.privaterooms.indexOf(toId(detail)) > -1) return;
		var now = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: now
		};
		if (!detail) return;
		var userData = this.chatData[user];
		var msg = '';
		switch (type) {
			case 'j':
			case 'J':
				msg += 'joining ';
				break;
			case 'l':
			case 'L':
				msg += 'leaving ';
				break;
			case 'c':
			case 'c:':
				msg += 'chatting in ';
				break;
			case 'N':
				msg += 'changing nick to ';
				if (detail.charAt(0) !== ' ') detail = detail.substr(1);
				break;
		}
		msg += detail.trim() + '.';
		userData.lastSeen = msg;
		userData.seenAt = now;
	},
};


/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals join */
/* globals leave */
/* globals invite */
/* globals send */
/* globals cmdr */
/* globals error */
/* globals Commands */
/* globals fs */
/* globals Plugins */
/* globals Battle */
/* globals info */
/* globals ok */
/* globals Tools */
