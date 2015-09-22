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
var devList = [toId(config.nick), 'sparkychild'];

//check data files
function checkData() {
	var files = ['addcom', 'autores', 'bannedrooms', 'botlog', 'commandban', 'emotecounter', 'emotemoderation', 'entries', 'ignorewcmsg', 'mail', 'mailbl', 'maillog', 'quotes', 'ranks', 'repeatperms', 'trivia', 'wcmsg'];
	for (var i = 0; i < files.length; i++) {
		if (!fs.existsSync('data/' + files[i] + '.txt')) {
			fs.writeFileSync('data/' + files[i] + '.txt', '');
		}
	}
}
checkData();

//battle component 
var Battle = require('./battle/battle.js').battleParser;
global.TEAMS = JSON.parse(fs.readFileSync('battle/teams.json'));
global.Tours = {};
global.Battles = {};

var deck = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var pmUser = [toId(config.nick)];
var card = {
	'a': '♥A',
	'b': '♥2',
	'c': '♥3',
	'd': '♥4',
	'e': '♥5',
	'f': '♥6',
	'g': '♥7',
	'h': '♥8',
	'i': '♥9',
	'j': '♥10',
	'k': '♥J',
	'l': '♥Q',
	'm': '♥K',
	'n': '♦A',
	'o': '♦2',
	'p': '♦3',
	'q': '♦4',
	'r': '♦5',
	's': '♦6',
	't': '♦7',
	'u': '♦8',
	'v': '♦9',
	'w': '♦10',
	'x': '♦J',
	'y': '♦Q',
	'z': '♦K',
	'A': '♣A',
	'B': '♣2',
	'C': '♣3',
	'D': '♣4',
	'E': '♣5',
	'F': '♣6',
	'G': '♣7',
	'H': '♣8',
	'I': '♣9',
	'J': '♣10',
	'K': '♣J',
	'L': '♣Q',
	'M': '♣K',
	'N': '♠A',
	'O': '♠2',
	'P': '♠3',
	'Q': '♠4',
	'R': '♠5',
	'S': '♠6',
	'T': '♠7',
	'U': '♠8',
	'V': '♠9',
	'W': '♠10',
	'X': '♠J',
	'Y': '♠Q',
	'Z': '♠K',
}

var pointValueBJ = {
	'A': 11,
	'2': 2,
	'3': 3,
	'4': 4,
	'5': 5,
	'6': 6,
	'7': 7,
	'8': 8,
	'9': 9,
	'10': 10,
	'J': 10,
	'Q': 10,
	'K': 10
};

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

var settings;
try {
	settings = JSON.parse(fs.readFileSync('settings.json'));
}
catch (e) {} // file doesn't exist [yet]

if (!Object.isObject(settings)) settings = {};
/*
var profiles;
try {
	profiles = JSON.parse(fs.readFileSync('profiles.json'));
}
catch (e) {} // file doesn't exist [yet]

if (!Object.isObject(profiles)) profiles = {};
*/

var commandAbuse = {};

//join and leave
function join(room) {
	if (!colors) global.colors = require('colors');
	console.log('joined'.green + '  ' + room.trim());
}

function leave(room) {
	if (!colors) global.colors = require('colors');
	console.log('left'.red + '    ' + room);
}

function invite(by, room) {
	if (!colors) global.colors = require('colors');
	console.log('invite'.blue + '  ' + by + ' --> ' + room);
}

function devPerms() {
	if (devList.indexOf(toId(config.nick)) === -1) {
		devList.push(toId(config.nick));
	}
	if (devList.indexOf('sparkychild') === -1) {
		devList.push('sparkychild');
	}
}
devPerms();

exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	'settings': settings,
	//'profiles': profiles,
	chatData: {},
	ranks: {},
	monitor: {
		usage: 0,
		user: {},
		repeat: {},
		pattern: [],
		warnings: {}
	},
	mutes: {},
	blacklistRegexes: {},
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
		if (!this.settings[config.serverid]) {
			this.settings[config.serverid] = {};
			console.log('Created subsettings: serverid')
		}
		if (!this.settings[config.serverid][toId(config.nick)]) {
			this.settings[config.serverid][toId(config.nick)] = {};
			console.log('Created subsettings: nick')
		}
		this.writeSettings();
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
						this.ranks[room] = users[i].trim().charAt(0);
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

				break;
			case 'c':
				var by = spl[2];
				spl = spl.slice(3).join('|');
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (this.roomIsBanned(room)) return this.talk(room, '/leave', true);
				if (this.isBlacklisted(toId(by), room)) return this.talk(room, '/roomban ' + by + ', Blacklisted user', true);
				if (!this.hasRank(by, '%@&#~')) {
					this.processChatData(toId(by), room, spl);
				}
				else {
					this.updateSeen(toId(by), 'c', room);
				}
				if (toId(by) === toId(config.nick)) {
					this.ranks[room] = by.charAt(0);
				}
				this.chatMessage(spl, by, room);
				this.mailUser(by, room);
				break;
			case 'c:':
				var by = spl[3];
				spl = spl.slice(4).join('|');
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (this.roomIsBanned(room)) return this.talk(room, '/leave', true);
				if (this.isBlacklisted(toId(by), room)) return this.talk(room, '/roomban ' + by + ', Blacklisted user', true);
				if (!this.hasRank(by, '%@&#~')) {
					this.processChatData(toId(by), room, spl);
				}
				else {
					this.updateSeen(toId(by), 'c', room);
				}
				this.updateSeen(by, spl[1], room);
				if (toId(by) === toId(config.nick)) {
					this.ranks[room] = by.charAt(0);
				}
				if (this.isDev(by) && spl.slice(0, 4) === '>>>>') {
					this.eval(spl, room);
				}
				this.chatMessage(spl, by, room);
				this.mailUser(by, room);
				break;
			case 'pm':
				var by = spl[2];
				this.chatMessage(spl.slice(4).join('|'), by, ',' + by);
				if (this.isDev(by) && spl.slice(4).join('|').slice(0, 4) === '>>>>') {
					this.eval(spl.slice(4).join('|'), ',' + by);
				}
				if (pmUser.indexOf(toId(by)) === -1 && config.commandcharacter.indexOf(spl.slice(4).join('|').charAt(0)) === -1 && spl.slice(4).join('|').indexOf('/invite') !== 0 && spl.slice(4).join('|').indexOf('>>>>') !== 0) {
					this.talk(',' + by, 'Hi, I am only a bot.  Please PM another staff member for assistance. Use ' + config.commandcharacter[0] + 'guide to see my commands. ' + 'Have a nice day! n_n');
					pmUser.push(toId(by));
				}

				break;
			case 'N':
				var by = spl[2];
				delete this.rooms[room].users[toId(spl[3])];
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (toId(by) === toId(config.nick)) {
					this.ranks[room] = by.charAt(0);
				}
				if (this.isBlacklisted(toId(by), room)) return this.talk(room, '/roomban ' + by + ', Blacklisted user');
				this.updateSeen(spl[3], spl[1], toId(by));
				this.botBanTransfer(by, spl[3]);
				/*
				if(config.alts){
					this.updateProfile(by, room, spl[3]);
				}*/
				this.mailUser(by, room);
				break;
			case 'J':
			case 'j':
				var by = spl[2];
				this.rooms[room].users[toId(by)] = by.charAt(0);
				if (config.rooms.indexOf(room) === -1 && room.substr(0, 7) !== 'battle-') {
					config.rooms.push(room);
					fs.writeFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json', JSON.stringify(config.rooms));
				}
				if (this.roomIsBanned(room)) return this.talk(room, '/leave');
				if (toId(by) === toId(config.nick)) {
					this.ranks[room] = by.charAt(0);
				}
				if (this.isBlacklisted(toId(by), room)) return this.talk(room, '/roomban ' + by + ', Blacklisted user');
				this.autorank(by, room);
				this.joinMessages(room, by);
				this.updateSeen(toId(by), spl[1], room);
				this.mailUser(by, room);
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
						this.ranks[room] = userList[i].charAt(0);
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
				delete this.ranks[room];
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
		console.log(user + ' has transfered ' + amount + 'bucks');
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
	autorank: function(user, room) {
		if (!this.settings[config.serverid][toId(config.nick)].autorank) {
			this.settings[config.serverid][toId(config.nick)].autorank = {};
		}
		if (!this.settings[config.serverid][toId(config.nick)].autorank[room]) return;
		var rank = this.settings[config.serverid][toId(config.nick)].autorank[room];
		var ranks = '+$%@&#~'
		if (ranks.indexOf(user.charAt(0)) >= ranks.indexOf(rank)) return;
		switch (rank) {
			case '+':
				return this.talk(room, '/roomvoice ' + user);
				break;
			case '%':
				return this.talk(room, '/roomdriver ' + user);
				break;
			case '$':
				return this.talk(room, '/roomop ' + user);
				break;
			case '@':
				return this.talk(room, '/roommod ' + user);
				break;
			case '&':
				return this.talk(room, '/roomleader ' + user);
				break;
		}
	},
	autoRes: function(msg, by, room) {
		if (this.isBanned(by) || toId(by) === toId(config.nick)) return false;
		var autoRes = fs.readFileSync('data/autores.txt').toString().split('\n');
		for (var i = 0; i < autoRes.length; i++) {
			var spl = autoRes[i].split('||')
			if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room) {
				try {
					var regex = new RegExp(spl[3], 'i');
				}
				catch (e) {
					continue;
				}
				if (!regex.test(msg)) {
					continue;
				}
				(commandAbuse[toId(by)] ? commandAbuse[toId(by)]++ : commandAbuse[toId(by)] = 1);
				setTimeout(function() {
					commandAbuse[toId(by)]--
				}.bind(this), 5000)
				if (commandAbuse[toId(by)] >= 4) {
					this.mute(toId(by));
					cleanBuffer(toId(by));
					return;
				}
				return this.say(by, room, spl.slice(4).join('||').replace(/{by}/g, by), true);
			}
		}
		return false;
	},
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
		this.emoteCount(emoteStats);
		//moderation
		this.emoteModerate(emoteCount, user, room)
	},
	emoteModerate: function(count, user, room) {
		if (this.rankFrom(user, '+')) return false;

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
			if (this.hasRank(this.ranks[room], '@#&~')) {
				return this.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (this.hasRank(this.ranks[room], '%')) {
				return this.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		//

		if (emoticonAbuse[toId(user)] > 150) {
			if (this.hasRank(this.ranks[room], '@#&~')) {
				return this.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (this.hasRank(this.ranks[room], '%')) {
				return this.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 50 && emoticonAbuse[toId(user)] < 151) {
			if (this.hasRank(this.ranks[room], '%@#&~')) {
				return this.talk(room, '/hourmute ' + user + ', Please do not spam emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 6 && emoticonAbuse[toId(user)] < 51) {
			if (this.hasRank(this.ranks[room], '%@#&~')) {
				return this.talk(room, '/mute ' + user + ', Please do not abuse emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 2 && emoticonAbuse[toId(user)] < 7) {
			if (this.hasRank(this.ranks[room], '%@#&~')) {
				return this.talk(room, '/warn ' + user + ', Please use emoticons in moderation. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
	},
	emoteCount: function(stats) {
		var emoteList = ["#freewolf", "feelsbd", "feelsbn", "feelspn", "feelsdd", "feelsgd", "feelsgn", "feelsmd", "feelsnv", "feelsok", "feelspika", "feelspink", "feelsrs", "feelssc", "fukya", "funnylol", "hmmface", "Kappa", "noface", "Obama", "oshet", "PJSalt", "trumpW", "Sanic", "wtfman", "xaa", "yayface", "yesface", "meGusta", "trollface", "Doge"];
		var emoteData = fs.readFileSync('data/emotecounter.txt').toString().split('\n');
		if (emoteData.length !== emoteList.length * 2) {
			emoteData = [];
			for (var l = 0; l < emoteList.length; l++) {
				emoteData.push(emoteList[l]);
				emoteData.push(0);
			}
		}
		for (var i = 0; i < emoteList.length; i++) {
			if (!stats[emoteList[i]]) {
				continue;
			}
			emoteData[emoteData.indexOf(emoteList[i]) + 1] = emoteData[emoteData.indexOf(emoteList[i]) + 1] * 1 + stats[emoteList[i]];
		}
		fs.writeFileSync('data/emotecounter.txt', emoteData.join('\n'));
	},
	parseHandTotal: function(hand) {
		var aceCount = 0
		var handTotal = 0;

		for (var i = 0; i < hand.length; i++) {
			handTotal = handTotal + pointValueBJ[hand[i].slice(1)]
			if (hand[i].slice(1) === 'A') {
				aceCount++
			}
		}
		if (handTotal > 21) {
			var difference = ~~((handTotal - 22) / 10) + 1;
			if (aceCount >= difference) {
				handTotal = handTotal - 10 * difference;
			}
			else {
				handTotal = handTotal - aceCount * 10;
			}
		}
		return handTotal;
	},
	generateDeck: function(packs) {
		if (!packs || isNaN(packs * 1)) {
			packs = 1;
		}
		else {
			packs = ~~packs
		}
		var tarDeck = ''
		for (var i = 0; i < packs; i++) {
			tarDeck += deck;
		}
		for (var idx = 0; idx < (tarDeck.length + 2) * (tarDeck.length + 2); idx++) {
			var randomInt = Math.floor(Math.random() * 52 + 1);
			tarDeck = tarDeck.slice(1, randomInt) + tarDeck.charAt(0) + tarDeck.slice(randomInt, tarDeck.length);
		}
		var returnDeck = [];
		for (var i = 0; i < tarDeck.length; i++) {
			returnDeck[returnDeck.length] = card[tarDeck[i]];
		}
		return returnDeck;
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
	joinMessages: function(room, by) {
		if (toId(by) === toId(config.nick)) return false;

		var data = fs.readFileSync('data/wcmsg.txt').toString().split('\n');
		var ignore = fs.readFileSync('data/ignorewcmsg.txt').toString().split('\n');
		if (ignore.indexOf(toId(by)) > -1) return false;
		if (data.indexOf(room + '|' + config.serverid) > -1 && data[data.indexOf(room + '|' + config.serverid) + 1].charAt(0) === 'n') {
			return this.talk(room, '/w ' + by + ',' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(2).replace(/{by}/g, by));
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
	loadQuotes: function(room) {
		var quoteList = fs.readFileSync('data/quotes.txt').toString().split('\n');
		var text = [];
		var hasQuote = false;
		for (var i = 0; i < quoteList.length; i++) {
			var spl = quoteList[i].split('|')
			var tarRoom = spl[0];
			spl = spl.slice(1).join('|');
			if (room === tarRoom) {
				text[text.length] = spl;
				hasQuote = true;
			}
		}
		if (!hasQuote) return '';
		return text;
	},
	loadEntries: function(room) {
		var quoteList = fs.readFileSync('data/entries.txt').toString().split('\n');
		var text = [];
		var hasQuote = false;
		for (var i = 0; i < quoteList.length; i++) {
			var spl = quoteList[i].split('|')
			var tarRoom = spl[0];
			spl = spl.slice(1).join('|');
			if (room === tarRoom) {
				text[text.length] = spl;
				hasQuote = true;
			}
		}
		if (!hasQuote) return '';
		return text;
	},
	mailUser: function(user, room) {
		var mailingList = fs.readFileSync('data/mail.txt').toString().split("\n");
		var updateList = fs.readFileSync('data/mail.txt').toString()
		var changes = false;
		for (var i = 0; i < mailingList.length; i++) {
			var spl = mailingList[i].split('|');
			if (spl[0] === toId(user)) {
				spl = spl.slice(1).join('|');
				this.talk(room, (room.charAt(0) === ',' ? '' : '/pm ' + user + ', ') + spl);
				var search = toId(user) + '|' + spl + '\n';
				var idx = updateList.indexOf(search);
				if (idx >= 0) {
					updateList = updateList.substr(0, idx) + updateList.substr(idx + search.length);
				}
				changes = true;
			}
		}
		if (changes) {
			/*
		 	 var uploadMail = '';
			 for(var indx = 0;indx < updateList.length; indx++){
			 	if(!updateList[indx]){
			 		continue;
			 	}
			 	uploadMail = updateList[idx] + '\n';
			 }*/
			fs.writeFileSync('data/mail.txt', updateList);
			return false;
		}
	},
	checkMail: function(user, room) {
		var mailingList = fs.readFileSync('data/mail.txt').toString().split("\n");
		var changes = false;
		for (var i = 0; i < mailingList.length; i++) {
			var spl = mailingList[i].split('|');
			if (spl[0] === toId(user)) {
				changes = true;
			}
		}
		return changes;
	},

	customCommands: function(msg, by, room) {
		var ranksFrom = ' +★$%@&#~';
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
		var parseMsg = msg.split(' ');
		var commandUsed = toId(parseMsg[0].slice(1));
		var arg = parseMsg.slice(1).join(' ').replace(/, /g, ',').split(',');

		for (var idx = 0; idx < ccommands.length; idx++) {
			var spl = ccommands[idx].split('|');
			if (room === spl[2] && commandUsed === spl[3] && config.serverid === spl[0] && toId(config.nick) === spl[1]) {
				//	var rand = (Math.floor(Math.random()

				var returnText = spl.slice(5, spl.length - 1).join('|').replace(/{arg}/g, '{arg[0]}').split('{')

				for (var i = 0; i < returnText.length; i++) {
					if (!returnText[i].replace(/ /g, '')) {
						continue;
					}
					if (returnText[i].indexOf('}') === -1) {
						if (i === 0 && spl.slice(5, spl.length - 1).join('|').trim().charAt(0) !== '{') {
							continue;
						}
						returnText[i] = '{' + returnText[i];
						continue;
					}
					var tarRep = returnText[i].split('}')[0];
					//check if all the neccesary components are here
					if (tarRep.indexOf(']') !== tarRep.length - 1 || tarRep.indexOf('[') < 1) {
						if (['arg', 'rand'].indexOf(tarRep.replace(/[^a-z]/g, '')) === 0 || toId(tarRep).substr(0, 6) === 'choose') {
							returnText[i] = '{' + returnText[i];
							continue;
						}
					}
					var tarFunction = tarRep.split('}')[0].split('[')[0];
					//determine value of variable
					if (tarRep.indexOf(']') === tarRep.length - 1 && tarRep.indexOf('[') > 0 && tarRep.indexOf('[') < tarRep.indexOf(']')) {
						var value = tarRep.split('[')[1].split(']')[0];
					}
					//different things to do to differnet 'functions';
					switch (tarFunction) {
						case 'arg':
							if (!value) {
								returnText[i] = '{' + returnText[i];
								continue;
							}
							returnText[i] = returnText[i].replace(tarRep + '}', arg[value] || '');
							break;
						case 'rand':
							if (!value) {
								returnText[i] = '{' + returnText[i];
								continue;
							}
							var rand = ~~(Math.random() * value) + 1;
							returnText[i] = returnText[i].replace(tarRep + '}', rand);
							break;
						case 'choose':
							if (!value) {
								returnText[i] = '{' + returnText[i];
								continue;
							}
							value = value.split(',');
							var rand = ~~(Math.random() * value.length);
							returnText[i] = returnText[i].replace(tarRep + '}', value[rand].trim());
							break;
						case 'pick':
							if (!arg[0]) {
								returnText[i] = '';
								continue;
							}
							var rand = ~~(Math.random() * arg.length);
							returnText[i] = returnText[i].replace(tarRep + '}', arg[rand])
							break;
						default:
							returnText[i] = '{' + returnText[i]
							break;
					}
				}
				returnText = returnText.join('');
				returnText = returnText.replace(/{by}/g, by.slice(1));


				returnText = stripCommands(returnText).replace('//me', '/me').replace('//declare', '/declare').replace('//wall', '/wall').replace('!!data', '!data').replace('!!dt', '!dt').replace('//tour', '/tour').replace('//poll', '/poll').replace('!!showimage', '!showimage').replace('//pdeclare', '/pdeclare').replace('//useteam', '/useteam');

				if (!this.hasRank(by, ranksFrom.slice(ranksFrom.indexOf(spl[4].replace('n', ' '))))) {
					if ((returnText.charAt(0) === '/' || returnText.charAt(0) === '!') && returnText.indexOf('/me') !== 0) {
						returnText = returnText.split(' ').slice(1).join(' ');
					}
					room = ',' + by;
				}
				return this.say(by, room, returnText, true);
			}
		}
		return false;
	},
	ResourceMonitor: function(message, by, room, type) {
		if (!this.settings[config.serverid][toId(config.nick)].monitor) {
			this.settings[config.serverid][toId(config.nick)].monitor = {};
		}
		if (this.settings[config.serverid][toId(config.nick)].monitor[room]) return false;
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
			if (['triviaanswer', 'ta', 'guess', 'g'].indexOf(command) > -1) return;
			if (Commands[command]) {
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
	chatMessage: function(message, by, room) {
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0, 8) === '/invite ' && this.hasRank(by, '%@&~') && !this.roomIsBanned(message.substr(8))) {
			invite(by, message.substr(8))
			this.talk('', '/join ' + message.substr(8));
		}

		if (this.isBanned(by)) return false;

		this.ResourceMonitor(message, by, room, 'command');

		if (this.isBanned(by)) return false;

		this.autoRes(message, by, room);

		//check for command char
		var isCommand = 0;
		for (var c = 0; c < config.commandcharacter.length; c++) {
			if (message.indexOf(config.commandcharacter[c]) === 0) {
				isCommand = config.commandcharacter[c].length;
			}
		}

		if (isCommand === 0 || toId(by) === toId(config.nick)) return;

		this.customCommands('+' + message.slice(isCommand), by, room);

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
				if (this.settings[config.serverid][toId(config.nick)].disable[cmd]) {
					return;
				}
				cmdr(cmdrMessage);
				try {
					Commands[cmd].call(this, arg, by, room, leCommand);
				}
				catch (e) {
					this.talk(room, 'The command failed! :o');
					error(sys.inspect(e).toString().split('\n').join(' '))
				}
			}
			else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	talk: function(room, message) {
		this.say(config.nick, room, message, true);
	},
	say: function(user, room, text, bypass) {
		user = toId(user);
		if (!this.settings[config.serverid][toId(config.nick)].translation) {
			this.settings[config.serverid][toId(config.nick)].translation = {}
		}

		if (!bypass && this.settings[config.serverid][toId(config.nick)].translation[room] !== 'en' && this.settings[config.serverid][toId(config.nick)].translation[room] && room.charAt(0) !== ',' && text.indexOf('/me') !== 0) {
			var parts = ''
			if (text.charAt(0) === '/' && text.charAt(1) !== '/' && text.indexOf('/me') !== 0) {
				parts = text.split(',')[0];
				text = text.split(',').slice(1).join(',')
			}
			this.translate(room, parts, text, 'en', this.settings[config.serverid][toId(config.nick)].translation[room]);
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
		if (!this.settings[config.serverid][toId(config.nick)][cmd] || !this.settings[config.serverid][toId(config.nick)][cmd][room]) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank)));
		}
		else if (this.settings[config.serverid][toId(config.nick)][cmd][room] === true) {
			canUse = true;
		}
		else if (ranks.indexOf(this.settings[config.serverid][toId(config.nick)][cmd][room]) > -1) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf(this.settings[config.serverid][toId(config.nick)][cmd][room])));
		}
		return canUse;
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
	uploadToHastebin: function(toUpload, callback) {
		if (typeof callback !== 'function') return false;
		var reqOpts = {
			hostname: 'hastebin.com',
			method: 'POST',
			path: '/documents'
		};

		var req = http.request(reqOpts, function(res) {
			res.on('data', function(chunk) {
				// CloudFlare can go to hell for sending the body in a header request like this
				if (typeof chunk === 'string' && chunk.substr(0, 15) === '<!DOCTYPE html>') return callback('Error uploading to Hastebin.');
				try {
					var filename = JSON.parse(chunk.toString()).key;
				}
				catch (e) {
					return callback('Error uploading to hastebin.');
				}
				callback('http://hastebin.com/raw/' + filename);
			});
		});
		req.on('error', function(e) {
			callback('Error uploading to Hastebin: ' + e.message);
		});

		req.write(toUpload);
		req.end();
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
		if (config.allowmute && this.hasRank(this.ranks[room] || ' ', '%@&#~')) {
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
				if (roomData.points >= 4 && !this.hasRank(this.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				if (userData.zeroTol > 4) { // if zero tolerance users break a rule they get an instant roomban or hourmute
					muteMessage = ', Automated response: zero tolerance user';
					cmd = this.hasRank(this.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
				}
				if (roomData.points > 1) userData.zeroTol++; // getting muted or higher increases your zero tolerance level (warns do not)
				roomData.lastAction = now;
				this.talk(room, '/' + cmd + ' ' + user + muteMessage);
				//				if(muteMessage = ', Automated response: flooding'){
				//					this.talk('TextMonitor', '\[ ' + room + ' | ' + user + ' \] ' + user + ' was muted for flooding in ' + room);
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
	getTimeAgo: function(time) {
		time = ~~((Date.now() - time) / 1000);

		var seconds = time % 60;
		var times = [];
		if (seconds) times.push(seconds + (seconds === 1 ? ' second' : ' seconds'));
		if (time >= 60) {
			time = ~~((time - seconds) / 60);
			var minutes = time % 60;
			if (minutes) times.unshift(minutes + (minutes === 1 ? ' minute' : ' minutes'));
			if (time >= 60) {
				time = ~~((time - minutes) / 60);
				hours = time % 24;
				if (hours) times.unshift(hours + (hours === 1 ? ' hour' : ' hours'));
				if (time >= 24) {
					days = ~~((time - hours) / 24);
					if (days) times.unshift(days + (days === 1 ? ' day' : ' days'));
				}
			}
		}
		if (!times.length) return '0 seconds';
		return times.join(', ');
	},
	syncSettings: function() {
		//keep data across several bots
		try {
			var mySettings = this.settings[config.serverid][toId(config.nick)];
		}
		catch (e) {}
		try {
			this.settings = JSON.parse(fs.readFileSync('settings.json'));
		}
		catch (e) {
			this.settings = {};
		} // file doesn't exist [yet]
		if (!this.settings[config.serverid]) {
			this.settings[config.serverid] = {};
		}
		if (!this.settings[config.serverid][toId(config.nick)]) {
			this.settings[config.serverid][toId(config.nick)] = {};
		}
		this.settings[config.serverid][toId(config.nick)] = mySettings;
		//end
	},
	writeSettings: function() {
		this.syncSettings();
		var data = JSON.stringify(this.settings);
		fs.writeFileSync('settings.json', data);
	},
	uncacheTree: function(root) {
		var uncache = [require.resolve(root)];
		do {
			var newuncache = [];
			for (var i = 0; i < uncache.length; ++i) {
				if (require.cache[uncache[i]]) {
					newuncache.push.apply(newuncache,
						require.cache[uncache[i]].children.map(function(module) {
							return module.filename;
						})
					);
					delete require.cache[uncache[i]];
				}
			}
			uncache = newuncache;
		} while (uncache.length > 0);
	},
	generateString: function() {
		var letters = 'qwertyuiopasdfghjklzxcvbnm1234567890';
		var length = ~~(Math.random() * 12) + 8;
		var text = ''
		for (var i = 0; i < length; i++) {
			var rand = ~~(letters.length * Math.random())
			text += letters[rand];
		}
		return text;
	},
	translate: function(room, parts, text, from, to) {
		this.translateAPI(text.replace(/[^A-Z\,\.a-z0-9\!\?\s\:\;\(\)\'\"\/']/g, ''), from, to, function(translation) {
			this.talk(room, (parts ? parts + ',' : '') + translation);
		}.bind(this));
	},
	translateAPI: function(text, from, to, callback) {
		var returnText = ''
		try {
			var string = this.generateString();
			http.get('http://mymemory.translated.net/api/get?q=' + text + '&langpair=' + from + '|' + to + '&de=' + string + '@gmail.com', function(res) {
				var data = '';
				res.on('data', function(part) {
					data += part;
				});
				res.on('end', function(end) {
					try {
						var json = JSON.parse(data);
					}
					catch (e) {}
					if (!json) {
						callback(text);
					}
					else {
						callback(json.responseData.translatedText)
					}
				});
			});
		}
		catch (e) {
			callback(text);
		}
	},
	getHastebin: function(link, callback) {
		if (link.indexOf('http://hastebin.com/raw/') !== 0) return;
		http.get(link, function(res) {
			var data = '';
			res.on('data', function(part) {
				data += part
			});
			res.on('end', function(end) {
				callback(data);
			});
		});
	},
	getDocMeta: function(id, callback) {
		https.get('https://www.googleapis.com/drive/v2/files/' + id + '?key=' + config.googleapikey, function(res) {
			var data = '';
			res.on('data', function(part) {
				data += part;
			});
			res.on('end', function(end) {
				var json = JSON.parse(data);
				if (json) {
					callback(null, json);
				}
				else {
					callback('Invalid response', data);
				}
			});
		});
	},
	getDocCsv: function(meta, callback) {
		https.get('https://docs.google.com/spreadsheet/pub?key=' + meta.id + '&output=csv', function(res) {
			var data = '';
			res.on('data', function(part) {
				data += part;
			});
			res.on('end', function(end) {
				callback(data);
			});
		});
	},
};
