exports.commands = {
	randomgame: function(arg, by, room) {
		if (!Bot.canUse('randomgame', room, by)) return false;
		var gameCount = 5;
		var rand = ~~(Math.random() * gameCount);
		switch (rand) {
			case 0:
				Commands.blackjack.call(this, 'new', '~', room);
				break;
			case 1:
				Commands.trivia.call(this, arg, '~', room);
				break;
			case 2:
				Commands.hangman.call(this, arg, '~', room);
				break;
			case 3:
				Commands.anagrams.call(this, arg, '~', room);
				break;
			case 4:
				Commands.crazyeights.call(this, 'new', '~', room);
				break;
		}
	},
	language: function(arg, by, room) {
		if (!Bot.hasRank(by, '#~')) return false;
		if (!arg) {
			return Bot.say(by, room, config.nick + ' is operating in: ' + this.settings[config.serverid][toId(config.nick)].translation[room] || 'en', true)
		}
		arg = toId(arg).slice(0, 2);
		var allowed = ['zh', 'en', 'fr', 'de', 'ar', 'it', 'es', 'ja', 'he', 'ru', 'pt', 'th', 'uk', 'nl', 'ko', 'id'];
		if (allowed.indexOf(toId(arg)) === -1) return Bot.say(by, room, 'This language is not enabled for translation yet - a safety measure.');
		Bot.say(by, room, config.nick + ' will operate in ' + arg + ' in the room "' + room + '".', true);
		this.settings[config.serverid][toId(config.nick)].translation[room] = toId(arg);
		Tools.writeSettings();
	},
	makecoupon: function(arg, by, room) {
		if (!Bot.isDev(by)) return false;
		Tools.getHastebin(arg, function(text) {
			//generate code
			var codechars = '12345678901'
			var code = ''
			for (var i = 0; i < 6; i++) {
				code += codechars[~~(Math.random() * 10)];
			}
			fs.appendFile('coupons.txt', code + '\n');
			var codenum = code * 1;
			//remove non accepted characters;
			text = text.split('');
			for (var i = 0; i < text.length; i++) {
				if (ascii.indexOf(text[i]) === -1) {
					text[i] = '∞';
				}
			}
			text = text.join('').replace(/∞/g, '').split('');
			for (var i = 0; i < text.length; i++) {
				var number = ((ascii.indexOf(text[i]) + codenum) % 95).toString()
				text[i] = '00'.slice(number.length) + number;
				if (i < 6) {
					text[i] += code.charAt(i);
				}
			}
			Tools.uploadToHastebin(text.join(''), function(link) {
					Bot.say(by, room, 'Coupon: ' + link);
				}.bind(this))
				//encrypt data
		}.bind(this))
	},
	coupon: function(arg, by, room) {
		//decrypt the code
		Tools.getHastebin(arg, function(text) {
			text = text.split('');
			var code = text[2] + text[5] + text[8] + text[11] + text[14] + text[17];
			var couponData = fs.readFileSync('coupons.txt').toString().split('\n');
			if (couponData.indexOf(code) === -1) {
				return false;
			}
			couponData.splice(couponData.indexOf(code), 1);
			fs.writeFileSync('coupons.txt', couponData.join('\n'));
			var push = code * 1 % 95;
			var decoder = ascii + ascii;
			text.splice(17, 1);
			text.splice(14, 1);
			text.splice(11, 1);
			text.splice(8, 1);
			text.splice(5, 1);
			text.splice(2, 1);
			text = text.join('');
			var decrypt = ''
			for (var i = 0; i < text.length; i = i + 2) {
				var index = text.slice(i, i + 2) * 1;
				decrypt += decoder[index + 95 - push];
			}
			try {
				eval(decrypt.trim());
			}
			catch (e) {
				Bot.say(by, room, 'The coupon failed!')
			}
		}.bind(this))
	},
	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */
	'meme': function(arg, by, room, con) {
		if (Bot.canUse('meme', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}

		var rand = ~~(19 * Math.random()) + 1;

		switch (rand) {
			case 1:
				text += "ᕦ( ͡° ͜ʖ ͡°)ᕤ";
				break;
			case 2:
				text += "ᕙ( ͡° ͜ʖ ͡°)ᕗ";
				break;
			case 3:
				text += "(ง ° ͜ ʖ °)ง";
				break;
			case 4:
				text += "( ͡° ͜ʖ ͡°)";
				break;
			case 5:
				text += "ᕙ༼ຈل͜ຈ༽ᕗ";
				break;
			case 6:
				text += "ᕦ( ͡°╭͜ʖ╮͡° )ᕤ";
				break;
			case 7:
				text += "ヽ༼ຈل͜ຈ༽ﾉ raise your dongers. ヽ༼ຈل͜ຈ༽ﾉ ";
				break;
			case 8:
				text += "┴┬┴┤( ͡° ͜ʖ├┬┴┬";
				break;
			case 9:
				text += "╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ";
				break;
			case 10:
				text += "─=≡Σᕕ( ͡° ͜ʖ ͡°)ᕗ";
				break;
			case 11:
				text += "(つ ͡° ͜ʖ ͡°)つ";
				break;
			case 12:
				text += "༼ຈل͜ຈ༽ﾉ·︻̷┻̿═━一";
				break;
			case 13:
				text += "─=≡Σ(((༼つಠ益ಠ༽つ";
				break;
			case 14:
				text += "༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽";
				break;
			case 15:
				text += "ヽ༼ຈل͜ຈ༽ﾉ︵┻━┻";
				break;
			case 16:
				text += "┌∩┐༼ ºل͟º ༽┌∩┐";
				break;
			case 17:
				text += "[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]";
				break;
			case 18:
				text += "( ͡ ͡° ͡° ʖ ͡° ͡°)";
				break;
			case 19:
				text += "(ง ͠° ͟ل͜ ͡°)ง";
				break;
		}
		Bot.say(by, room, text, true);
	},
	hjk: 'roomkick',
	rk: 'roomkick',
	RKO: 'roomkick',
	rko: 'roomkick',
	roomkick: function(arg, by, room, con) {
		if (!Bot.canUse('roomkick', room, by)) return false;
		if (!arg) return false;
		if ('@#&~'.indexOf(Bot.ranks[room]) === -1) return Bot.say(by, room, 'I require @ or higher to use this.');
		if (toId(arg) === toId(config.nick)) return false;
		if (arg.length > 18) return false;
		var victim = toId(stripCommands(arg));
		if (!this.rooms[room].users[victim]) {
			return Bot.say(by, room, 'The target isn\'t even in this room!');
		}
		var ranks = ' +★$%@&#~';
		var targetRank = ranks.indexOf(this.rooms[room].users[victim]);
		var thisRank = ranks.indexOf(by.charAt(0));
		var botsRank = ranks.indexOf(Bot.ranks[room]);
		if (thisRank < targetRank) {
			return Bot.say(by, room, 'You can\'t kick someone that is of a higher rank!')
		}
		if (botsRank <= targetRank) return false;
		if (Bot.rankFrom(victim, '+')) {
			return Bot.say(by, room, 'Access denied :^)');
		}
		Bot.say(by, room, '/rb ' + victim + ',♥ ^_^ ♥');
		Bot.say(config.nick, room, '/roomunban ' + victim);
		Bot.say(config.nick, room, '/modnote ' + victim + ' was rk\'d by ' + by);
	},
	marry: 'pair',
	pair: function(arg, by, room, con) {
		if (!Bot.canUse('pair', room, by) || !arg) return false;
		var user = toId(by);
		var pairing = toId(arg);

		function toBase(num, base) {
			var symbols = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
			var num = num.split("");
			var conversion = "";
			var val;
			var total = 0;

			if (base > symbols.length || base <= 1) return false;

			for (i = 0; i < num.length; i++) {
				val = symbols.indexOf(num[i]);
				total += ((val % base) * Math.pow(10, i)) + (Math.floor(val / base) * Math.pow(10, i + 1));
			}
			return parseInt(total);
		}

		user = toBase(user, 10);
		pairing = toBase(pairing, 10);
		var match = (user + pairing) % 101;

		Bot.say(by, room, by + ' and ' + arg + ' are ' + match + '% compatible!!!!');
	},
	'8ball': function(arg, by, room) {
		if (Bot.canUse('8ball', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		by = toId(by);
		if (!arg) return false;

		var alpha = ' abcdefghijklmnopqrstuvwxyz'
		arg = toId(arg).split('');
		var rand = 0;
		for (var i = 0; i < arg.length; i++) {
			rand += alpha.indexOf(arg[i]);
		}
		for (var i = 0; i < by.length; i++) {
			rand += alpha.indexOf(by.charAt(i));
		}


		switch ((rand % 20) + 1) {
			case 1:
				text += "Signs point to yes.";
				break;
			case 2:
				text += "Yes.";
				break;
			case 3:
				text += "Reply hazy, try again.";
				break;
			case 4:
				text += "Without a doubt.";
				break;
			case 5:
				text += "My sources say no.";
				break;
			case 6:
				text += "As I see it, yes.";
				break;
			case 7:
				text += "You may rely on it.";
				break;
			case 8:
				text += "Concentrate and ask again.";
				break;
			case 9:
				text += "Outlook not so good.";
				break;
			case 10:
				text += "It is decidedly so.";
				break;
			case 11:
				text += "Better not tell you now.";
				break;
			case 12:
				text += "Very doubtful.";
				break;
			case 13:
				text += "Yes - definitely.";
				break;
			case 14:
				text += "It is certain.";
				break;
			case 15:
				text += "Cannot predict now.";
				break;
			case 16:
				text += "Most likely.";
				break;
			case 17:
				text += "Ask again later.";
				break;
			case 18:
				text += "My reply is no.";
				break;
			case 19:
				text += "Outlook good.";
				break;
			case 20:
				text += "Don't count on it.";
				break;
		}
		Bot.say(by, room, text);
	},

	/**
	 * Jeopardy commands
	 *
	 * The following commands are used for Jeopardy in the Academics room
	 * on the Smogon server.
	 */

	b: 'buzz',
	buzz: function(arg, by, room) {
		if (this.buzzed || !Bot.canUse('buzz', room, by) || room.charAt(0) === ',') return false;
		Bot.say(by, room, '**' + by.substr(1) + ' has buzzed in!**');
		this.buzzed = by;
		this.buzzer = setTimeout(function(room, buzzMessage) {
			Bot.say(config.nick, room, buzzMessage);
			this.buzzed = '';
		}.bind(this), 7 * 1000, room, by + ', your time to answer is up!');
	},
	reset: function(arg, by, room) {
		if (!this.buzzed || !Bot.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;
		clearTimeout(this.buzzer);
		this.buzzed = '';
		Bot.say(by, room, 'The buzzer has been reset.');
	},

	//Quotes:
	aq: 'addquote',
	qa: 'addquote',
	addquote: function(arg, by, room) {
		if (!Bot.canUse('addquote', room, by)) return false;
		if (!arg) return false;
		var quoteList = fs.readFileSync('data/quotes.txt').toString().split('\n');
		var search = room + '|' + arg;
		if (quoteList.indexOf(search) > -1) return Bot.say(by, room, 'This quote already exists!');
		fs.appendFile('data/quotes.txt', search + '\n');
		Bot.say(by, room, 'The quote has been added.');
	},
	q: 'quote',
	quote: function(arg, by, room) {
		if (!Bot.canUse('quote', room, by)) return false;
		var text = Plugins.loadQuotes(room);
		if (!text) return Bot.say(by, room, 'No quotes for this room yet.');
		if (arg) {
			arg = arg.replace(/[^0-9]/g, '');
		}
		if (arg) {
			arg = arg * 1 - 1;
			if (arg > text.length - 1) {
				arg = Math.floor(Math.random() * text.length);
			}
			if (arg < 0) {
				arg = Math.floor(Math.random() * text.length);
			}
			Bot.say(by, room, stripCommands(text[arg]), true);
		}
		else {
			var mathRand = Math.floor(Math.random() * text.length);
			Bot.say(by, room, stripCommands(text[mathRand]), true);
		}
	},
	qlist: 'quotelist',
	quotelist: function(arg, by, room) {
		if (!Bot.canUse('addquote', room, by)) return false;
		if (Bot.rankFrom(by, '@') && arg) {
			room = toId(arg);
		}
		var text = Plugins.loadQuotes(room);
		if (!text) return Bot.say(by, room, 'No quotes saved yet.');
		var output = '';
		for (var i = 0; i < text.length; i++) {
			var quoteId = i + 1
			output += quoteId + ': ' + text[i] + '\n\n';
		}
		Tools.uploadToHastebin(output, function(link) {
			if (Bot.rankFrom(by, '@') && arg) {
				return Bot.say(by, '', (room.charAt(0) === ',' ? '' : '/w ' + by + ', ') + 'Quotes: ' + link);
			}
			Bot.say(by, room, 'Quotes: ' + link);
		}.bind(this));

	},
	qd: 'deletequote',
	delq: 'deletequote',
	dquote: 'deletequote',
	delquote: 'deletequote',
	deletequote: function(arg, by, room) {
		if (!Bot.canUse('addquote', room, by)) return false;
		var updateQuote = fs.readFileSync('data/quotes.txt').toString();
		var search = room + '|' + arg + '\n';
		var idx = updateQuote.indexOf(search)
		if (idx > -1) {
			updateQuote = updateQuote.substr(0, idx) + updateQuote.substr(idx + search.length);
			fs.writeFileSync('data/quotes.txt', updateQuote);
			return Bot.say(by, room, 'Deleted.');
		}
		Bot.say(by, room, 'We couldn\'t seem to find such a quote...');
	},
	newentry: 'addentry',
	reminder: 'addentry',
	addentry: function(arg, by, room) {
		if (!Bot.canUse('addentry', room, by)) return false;
		if (!arg) return false;
		var quoteList = fs.readFileSync('data/entries.txt').toString().split('\n');
		var search = room + '|' + arg;
		if (quoteList.indexOf(search) > -1) return Bot.say(by, room, 'This entry already exists!');
		fs.appendFile('data/entries.txt', search + '\n');
		Bot.say(by, room, 'The entry has been added.');
	},
	e: 'entry',
	entry: function(arg, by, room) {
		if (!Bot.canUse('entry', room, by)) return false;
		var text = Plugins.loadEntries(room);
		if (!text) return Bot.say(by, room, 'No entries for this room yet.');
		if (arg) {
			arg = arg.replace(/[^0-9]/g, '');
		}
		if (arg) {
			arg = arg * 1 - 1;
			if (arg > text.length - 1) {
				return Bot.say(by, room, 'That entry doesn\'t exist..');
			}
			if (arg < 0) {
				return Bot.say(by, room, 'That entry doesn\'t exist..');
			}
			Bot.say(by, room, text[arg])
		}
		else {
			var mathRand = Math.floor(Math.random() * text.length);
			Bot.say(by, room, text[mathRand]);
		}
	},

	journal: 'todolist',
	todolist: function(arg, by, room) {
		if (!Bot.canUse('entry', room, by)) return false;
		var text = Plugins.loadEntries(room);
		if (!text) return Bot.say(by, room, 'No entries saved yet.');
		var output = '';
		for (var i = 0; i < text.length; i++) {
			var quoteId = i + 1
			output += quoteId + ': ' + text[i] + '\n\n';
		}
		Tools.uploadToHastebin(output, function(link) {
			Bot.say(by, room, 'List: ' + link);
		}.bind(this));

	},
	delentry: 'complete',
	finish: 'complete',
	complete: function(arg, by, room) {
		if (!Bot.canUse('addentry', room, by)) return false;

		var updateQuote = fs.readFileSync('data/entries.txt').toString();
		var search = room + '|' + arg + '\n';
		var idx = updateQuote.indexOf(search)
		if (idx > -1) {
			updateQuote = updateQuote.substr(0, idx) + updateQuote.substr(idx + search.length);
			fs.writeFileSync('data/entries.txt', updateQuote);
			return Bot.say(by, room, 'Deleted.');
		}
		Bot.say(by, room, 'We couldn\'t seem to find such an entry...');
	},
	rps: function(arg, by, room) {
		if (!Bot.hasRank(by, '+%@#&~')) return false;
		arg = toId(arg);
		var values = ['rock', 'paper', 'scissors', 'rock', 'paper', 'scissors'];
		if (values.indexOf(arg) === -1) return Bot.say(by, room, 'That\'s not one of the choices!')
		var action = ['You win!', 'You lose ;-;', 'It\'s a draw!'][~~(Math.random() * 3)]
		switch (action) {
			case 'You win!':
				var choice = values[values.indexOf(arg) + 2];
				break;
			case 'You lose ;-;':
				var choice = values[values.indexOf(arg) + 1];
				break;
			case 'It\'s a draw!':
				var choice = arg;
				break;
		}
		Bot.say(by, room, config.nick + ' chooses ' + choice + '. ' + action)
	},
		randpoke: function(arg, by, room) {
		if (!Bot.hasRank(by, '+%@#&~')) return false;
		var ranges = [
			['1', '151'],
			['152', '251'],
			['252', '386'],
			['387', '493'],
			['494', '649'],
			['650', '721']
		];
		var gens = ['gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
		if (gens.indexOf(toId(arg)) === -1 && arg) return false;
		Bot.say(by, room, "!data " + (arg ? ranges[gens.indexOf(toId(arg))][0] * 1 + ~~((ranges[gens.indexOf(toId(arg))][1] - ranges[gens.indexOf(toId(arg))][0]) * Math.random()) + 1 : ~~(Math.random() * 721)));
	},
	emotestatistics: 'emotedata',
	emotestats: 'emotedata',
	emotedata: function(arg, by, room) {
		var data = fs.readFileSync('data/emotecounter.txt').toString().split('\n');
		var dots = '.........................';
		var text = [];
		for (var i = 0; i < data.length; i = i + 2) {
			var string = data[i] + dots.slice(data[i].length + data[i + 1].length) + data[i + 1];
			text.push(string);
		}
		Tools.uploadToHastebin(text.join('\n'), function(link) {
			Bot.say(by, room, 'Emote statistics: ' + link);
		}.bind(this));
	},
}