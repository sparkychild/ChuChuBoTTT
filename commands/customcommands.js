exports.commands = {
    editcom: function(arg, by, room) {
		if (!Bot.canUse('addcom', room, by) || !arg || arg.split(',').length < 2) return false;
		var command = toId(arg.split(',')[0]);
		var output = arg.split(',').slice(1).join(',').trim();
		if (!output || output.length === 0) return false;
		var search = config.serverid + '|' + toId(config.nick) + '|' + room + '|' + command + '|';
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
		for (var i = 0; i < ccommands.length; i++) {
			if (ccommands[i].indexOf(search) === 0) {
				var spl = ccommands[i].split('|');
				var part = spl.slice(0, 5).join('|');
				ccommands[i] = part + '|' + output + '|' + by;
				fs.writeFileSync('data/addcom.txt', ccommands.join('\n'));
				return Bot.say(by, room, 'Command edited!');
			}
		}
		Bot.say(by, room, 'I was unable to find the command!');
	},
	setcom: function(arg, by, room) {
		if (!Bot.canUse('addcom', room, by) || !arg) return false;
		var command = toId(arg.split(',')[0]);
		var tarRanks = 'n+★%@#&~';
		var newRank = arg.split(',')[1];
		if (newRank) {
			newRank = newRank.trim();
		}
		if (newRank && (tarRanks.indexOf(newRank) === -1 || newRank.length !== 1)) return Bot.say(by, room, 'The format is ' + config.commandcharacter[0] + 'setcom [command], [rank]');
		var search = config.serverid + '|' + toId(config.nick) + '|' + room + '|' + command + '|';
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
		for (var i = 0; i < ccommands.length; i++) {
			if (ccommands[i].indexOf(search) === 0) {
				var spl = ccommands[i].split('|');
				if (!newRank) {
					return Bot.say(by, room, config.commandcharacter[0] + command + ' is usable by users ' + spl[4].replace('n', '"reg"') + ' and higher');
				}
				var part = spl.slice(0, 4).join('|');
				ccommands[i] = part + '|' + newRank + '|' + spl.slice(5).join('|');
				fs.writeFileSync('data/addcom.txt', ccommands.join('\n'));
				return Bot.say(by, room, 'Command "' + command + '" is set at rank ' + newRank + '.');
			}
		}
		Bot.say(by, room, 'I was unable to find the command!');
	},
	addcom: function(arg, by, room) {
		if (!Bot.canUse('addcom', room, by)) return false;
		var splarg = arg.split(',');
		var tarRanks = 'n+★%@#&~';
		if (!splarg[0] || !splarg[1] || !splarg[2]) {
			Bot.say(by, room, 'The correct format is ' + config.commandcharacter[0] + 'addcom __command__, __rank__, __output__');
			return false;
		}

		splarg[0] = toId(splarg[0]);
		splarg[1] = splarg[1].trim();

		if (!splarg[0] || !splarg[1] || !splarg[2]) {
			Bot.say(by, room, 'The correct format is ' + config.commandcharacter[0] + 'addcom __command__, __rank__, __output__');
			return false;
		}
		if (!(tarRanks.indexOf(splarg[1]) > -1) || splarg[1].length !== 1) {
			splarg[1] = config.defaultrank;
		}
		if (Commands[splarg[0]]) {
			Bot.say(by, room, 'Such a command already exists naturally on the bot.');
			return false;
		}
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");

		for (var idx = 0; idx < ccommands.length; idx++) {
			var comspl = ccommands[idx].split('|');
			if (room === comspl[2] && splarg[0] === comspl[3] && comspl[0] === config.serverid && comspl[1] === toId(config.nick)) {
				return Bot.say(by, room, 'This custom command already exists! To change it, use ' + config.commandcharacter[0] + 'editcom [command], [output]');
			}
		}
		fs.appendFile('data/addcom.txt', config.serverid + '|' + toId(config.nick) + '|' + room + '|' + splarg[0] + '|' + splarg[1] + '|' + splarg.slice(2).join(',') + '|' + by + '\n');
		Bot.say(by, room, 'The custom command "' + splarg[0] + '" has successfully been entered!!!');
	},
	delcom: 'deletecom',
	deletecom: function(arg, by, room) {
		if (!Bot.canUse('addcom', room, by) || !arg) return false;

		var success = false;
		var bannedwords = fs.readFileSync('data/addcom.txt').toString().split('\n');
		var temp = fs.readFileSync('data/addcom.txt').toString();

		for (var i = 0; i < bannedwords.length; i++) {
			var spl = bannedwords[i].toString().split('|');
			if (arg == spl[3] && spl[2] == room && spl[1] === toId(config.nick) && spl[0] === config.serverid) {
				var search = spl.join('|');
				var idx = temp.indexOf(search);
				if (idx >= 0) {
					var output = temp.substr(0, idx) + temp.substr(idx + search.length);
					output = output.replace(/^\s*$[\n\r]{1,}/gm, '');
					fs.writeFileSync('data/addcom.txt', output);
					Bot.say(by, room, 'The command "' + arg + '" has been removed from the room ' + room);
					success = true;
				}
			}
		}
		if (success == false) Bot.say(by, room, 'The command does not exist');
	},
	comlist: function(arg, by, room) {
		if (!Bot.canUse('comlist', room, by)) return false;

		if (Bot.rankFrom(by, '@') && arg) {
			room = toId(arg);
			var allowInfo = true;
		}
		//allow more information?

		var comlist = fs.readFileSync('data/addcom.txt').toString().split('\n');
		var tarComlist = '';
		var success = false;
		for (var i = 0; i < comlist.length; i++) {
			var spl = comlist[i].split('|');
			if (room === spl[2] && toId(config.nick) === spl[1] && config.serverid === spl[0]) {
				tarComlist += spl[3] + ': For rank ' + spl[4] + ' and above. Output: ' + spl.slice(5, spl.length - 1).join('|') + (allowInfo ? '\nMade by: ' + spl[spl.length - 1] : '') + '\n\n';
				success = true;
			}
		}
		if (!success) {
			return Bot.say(by, (Bot.rankFrom(by, '@') && arg ? ',' + by : room), 'No custom commands for this room yet. ;-;');
		}
		else {
			Tools.uploadToHastebin(tarComlist, function(link) {
				if (Bot.rankFrom(by, '@') && arg) {
					return Bot.say(by, '', (room.charAt(0) === ',' ? '' : '/w ' + by + ', ') + 'Custom Command list for room ' + this.rooms[room].name + ": " + link);
				}
				Bot.say(by, room, 'Custom Command list for room ' + this.rooms[room].name + ": " + link);
			}.bind(this));
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
/* globals Tools */
/* globals Commands */
/* globals fs */
