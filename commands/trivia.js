exports.commands = {
	trivia: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!Bot.canUse('trivia', room, by)) return false;
		if (triviaON[room]) {
			Bot.say(by, room, 'A trivia game cannot be started, as it is in progress already.');
			return false;
		}
		if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
		triviaON[room] = true;
		triviaPoints[room] = [];
		triviaA[room] = [];
		game('trivia', room);
		if (!arg) {
			triviaScorecap[room] = 5;
		}
		else {
			var cap = arg.replace(/[^0-9]/g, '');
			if (cap) {
				triviaScorecap[room] = cap * 1;
			}
			else {
				triviaScorecap[room] = 5;
			}
		}
		Bot.say(by, room, 'Hosting a game of trivia\. First to ' + triviaScorecap[room] + ' points wins!  use ' + config.commandcharacter[0] + 'g or ' + config.commandcharacter[0] + 'ta to submit your answer\.');
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
		}, 17000);

	},
	ta: 'guesstrivia',
	guesstrivia: function(arg, by, room) {
		if (!triviaON[room] || !arg) return false;
		arg = toId(arg);
		if (!arg) return false;
		var user = toId(by);
		if (triviaA[room].indexOf(arg) !== -1) {
			triviaA[room] = [];
			if (!triviaPoints[room][user]) {
				triviaPoints[room][user] = 0;
			}
			triviaPoints[room][user]++;
			if (triviaPoints[room][user] >= triviaScorecap[room]) {
				Bot.say(config.nick, room, 'Congrats to ' + by + ' for winning! Reward: ' + Economy.getPayout((Object.keys(triviaPoints[room]).length * triviaScorecap[room]) / 4, room) + ' ' + Economy.currency(room));
				Economy.give(by, Economy.getPayout((triviaPoints[room].length), room), room);
				delete triviaON[room];
				clearInterval(triviaTimer[room]);
				return;
			}
			Bot.say(config.nick, room, '' + by.slice(1) + ' got the right answer, and has ' + triviaPoints[room][user] + ' point!');
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
		for (var i in triviaPoints[room]) {
			text += i + ' - ' + triviaPoints[room][i] + ' points, '
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