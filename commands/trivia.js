exports.commands = {
    trivia: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!Bot.canUse('trivia', room, by)) return false;
		if (triviaON[room]) {
			Bot.say(by, room, 'A trivia game cannot be started, as it is in progress already.');
			return false;
		}
		triviaON[room] = true;
		triviaPoints[room] = [];
		triviaA[room] = [];
		game('trivia', room);
		Bot.say(by, room, 'Hosting a game of trivia\. First to 10 points wins!  use ' + config.commandcharacter[0] + 'ta or ' + config.commandcharacter[0] + 'triviaanswer to submit your answer\.');
		triviaTimer[room] = setInterval(function() {
			if (triviaA[room][0]) {
				if (triviaA[room].length > 1) {
					Bot.say(config.nick, room, 'The correct answers are: ' + triviaA[room].join(', '));
				}
				else {
					Bot.say(config.nick, room, 'The correct answer is: ' + triviaA[room].join(', '));
				}
			}
			var TQN = 2 * (Math.floor(triviaQuestions.length * Math.random() / 2))
			triviaQ[room] = triviaQuestions[TQN];
			triviaA[room] = triviaQuestions[TQN + 1].toLowerCase().replace(/ /g, '').trim().split(',');
			Bot.say(config.nick, room, 'Question: __' + triviaQ[room] + '__');
		}.bind(this), 17000);

	},
	ta: 'triviaanswer',
	triviaanswer: function(arg, by, room) {
		if (!triviaON[room]) return false;
		arg = toId(arg);
		if (!arg) return false;
		var user = toId(by);
		if (triviaA[room].indexOf(arg) !== -1) {
			if (triviaPoints[room].indexOf(user) > -1) {
				triviaA[room] = [];
				triviaPoints[room][triviaPoints[room].indexOf(user) + 1] = triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + 1;
				if (triviaPoints[room][triviaPoints[room].indexOf(user) + 1] >= 10) {
					clearInterval(triviaTimer[room]);
					Bot.say(config.nick, room, 'Congrats to ' + by + ' for winning! Reward: ' + Economy.getPayout(triviaPoints[room].length, room) + ' ' + Economy.currency(room));
					Economy.give(by, Economy.getPayout((triviaPoints[room].length), room), room)
					triviaON[room] = false;
					return false;
				}
				Bot.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + ' points!');
			}
			else {
				triviaA[room] = [];
				triviaPoints[room][triviaPoints[room].length] = user;
				triviaPoints[room][triviaPoints[room].length] = 1;
				Bot.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + ' point!');
			}
		}
	},
	endtrivia: 'triviaend',
	triviaend: function(arg, by, room) {
		if (!Bot.canUse('trivia', room, by)) return false;
		clearInterval(triviaTimer[room]);
		if (!triviaON[room]) return false;
		Bot.say(by, room, 'The game of trivia has been ended.');
		triviaON[room] = false;
	},
	triviapoints: function(arg, by, room) {
		if (!triviaON[room]) return false;
		if (!Bot.canUse('trivia', room, by)) return false;
		var text = 'Points so far: '
		for (var i = 0; i < triviaPoints[room].length; i++) {
			text += '' + triviaPoints[room][i] + ': ';
			text += triviaPoints[room][i + 1] + ' points, ';
			i++
		}
		Bot.say(by, room, text);
	},
	trivialist: function(arg, by, room) {
		if (!Bot.rankFrom(by, '+') || room.charAt(0) !== ',') return false;
		var TriviaDataBase = fs.readFileSync('data/trivia.txt').toString().split('\n');
		var uploadText = '';
		for (var i = 0; i < TriviaDataBase.length - 1; i++) {
			uploadText += 'Question: ' + TriviaDataBase[i] + '\nAnswer: ' + TriviaDataBase[i + 1] + '\n\n'
			i++;
		}
		Tools.uploadToHastebin(uploadText, function(link) {
			Bot.say(by, room, 'List of Trivia Questions: ' + link);
		}.bind(this));
	},
	addtrivia: function(arg, by, room) {
		if (!Bot.rankFrom(by, '+') || room.charAt(0) !== ',') return false;
		arg = arg.split('::');
		if (!arg[1] || !arg[0]) return Bot.say(by, room, 'The format is ' + config.commandcharacter[0] + 'addtrivia [question]::[reponse],[response2]...');
		var saveAnswer = arg[1].toLowerCase().replace(/[^\,a-z0-9]/g, '');
		var saveQuestion = arg[0];
		var TriviaDataBase = fs.readFileSync('data/trivia.txt').toString().split('\n');
		if (TriviaDataBase.indexOf(saveQuestion) > -1) return Bot.say(by, room, 'This question already exists!');
		fs.appendFile('data/trivia.txt', '\n' + saveQuestion + '\n' + saveAnswer);
		Bot.say(by, room, 'Done!');
		triviaQuestions = fs.readFileSync('data/trivia.txt').toString().split('\n');
	},
}