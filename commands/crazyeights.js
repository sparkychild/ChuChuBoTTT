exports.commands = {
	'c8': 'crazyeights',
	crazyeights: function(arg, by, room) {
		if (room.charAt(0) === ',') return false;
		if (!crazyeight.gameStatus[room]) {
			crazyeight.gameStatus[room] = 'off';
		}
		if (!arg) {
			return false;
		}
		else {
			arg = toId(arg);
		}
		switch (arg) {
			case 'new':
				if (!Bot.canUse('crazyeights', room, by)) return false;
				if (crazyeight.gameStatus[room] !== 'off') return Bot.say(by, room, 'A crazyeights game is already going on!');
				if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
				Bot.say(by, room, 'A new game of Crazy Eights is starting. Do +crazyeights join to join the game!');
				Bot.say(config.nick, room, 'The goal is to be the first player to get rid of all your cards.  A [ 2] will cause the next player to draw 2 cards and lose their turn.');
				Bot.say(config.nick, room, 'A [ J] will skip the next player\'s turn and a [♠Q] will make the next player forfeit his/her turn and draw 4 cards. An [ 8] will allow the player to change the suit.');
				Bot.say(config.nick, room, 'You can play a card with either the same suit or number/letter.  The goal is to get rid of your cards before the other players do so.');
				Bot.say(config.nick, room, 'You only need to say first letter of the suit + value to play your card. Ex. ' + config.commandcharacter[0] + 'play sQ would be playing the Queen of Spades.');
				game('crazyeights', room);
				crazyeight.gameStatus[room] = 'signups';
				crazyeight.playerData[room] = {};
				crazyeight.playerList[room] = [];
				crazyeight.currentPlayer[room] = '';
				break;
			case 'join':
				if (crazyeight.gameStatus[room] !== 'signups') return false;
				if (crazyeight.playerData[room][toId(by)]) return Bot.say(by, room, 'You\'ve already signed up!');
				Bot.say(by, ',' + by, '(' + room + ')  Thank you for joining!');
				crazyeight.playerData[room][toId(by)] = {
					name: by.slice(1),
					hand: [],
					disqualified: false,
				};
				crazyeight.playerList[room][crazyeight.playerList[room].length] = toId(by);
				break;
			case 'leave':
				if (crazyeight.gameStatus[room] !== 'signups') return false;
				var pIndex = crazyeight.playerList[room].indexOf(toId(by));
				if (pIndex < 0) return false;
				var pushPlayer = [];
				for (var x = 0; x < crazyeight.playerList[room].length; x++) {
					if (x === pIndex) {
						continue;
					}
					pushPlayer.push(crazyeight.playerList[room][x]);
				}
				//reset playerlist
				crazyeight.playerList[room] = pushPlayer;
				delete crazyeight.playerData[room][toId(by)];
				break;
			case 'end':
				if (!Bot.canUse('crazyeights', room, by)) return false;
				if (gameStatus === 'off') return false;
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				Bot.say(by, room, 'The game was forcibly ended.');
				break;
			case 'start':
				if (!Bot.canUse('crazyeights', room, by)) return false;
				if (crazyeight.gameStatus[room] !== 'signups') return false;
				if (crazyeight.playerList[room].length < 2) return Bot.say(by, room, 'There aren\'t enough players ;-;');
				crazyeight.gameStatus[room] = 'on';
				crazyeight.deck[room] = Tools.generateDeck(1);

				Bot.say(by, room, 'Use ' + config.commandcharacter[0] + 'play [card] to play a card. c for clubs, h for hearts, s for spades and, d for diamonds. When playing a [ 8], be sure to include what you\'re changing to (' + config.commandcharacter[0] + 'play c8 s)');

				//deal the cards
				for (var j = 0; j < 7; j++) {
					for (var i = 0; i < crazyeight.playerList[room].length; i++) {
						var tarPlayer = crazyeight.playerList[room][i];
						crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
						crazyeight.deck[room] = crazyeight.deck[room].slice(1);
						if (crazyeight.deck[room].length === 0) {
							crazyeight.deck[room] = Tools.generateDeck(1);
						}
					}
				}

				// Determine/initialize topCard
				crazyeight.topCard[room] = crazyeight.deck[room][0];
				crazyeight.deck[room] = crazyeight.deck[room].slice(1);
				Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
				//new deck if all used up
				if (crazyeight.deck[room].length === 0) {
					crazyeight.deck[room] = Tools.generateDeck(1);
				}
				//start the turns


				//init first player
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][0];

				Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
				Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');


				crazyeight.interval[room] = setInterval(function() {
					if (crazyeight.gameStatus[room] !== 'on') {
						clearInterval(crazyeight.interval[room]);
						return false;
					}

					//disqualify for inactivity
					crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
					//re-make playerlist
					var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
					var pushPlayer = [];
					for (var x = 0; x < crazyeight.playerList[room].length; x++) {
						if (x === pIndex) {
							continue;
						}
						pushPlayer.push(crazyeight.playerList[room][x]);
					}
					//reset playerlist
					crazyeight.playerList[room] = pushPlayer;

					//checking if all players are DQ'd

					if (crazyeight.playerList[room].length === 0) {
						Bot.say(config.nick, room, 'Nobody wins this game :(');
					}
					else if (crazyeight.playerList[room].length === 1) {
						Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
						Bot.say(config.nick, room, 'Rewards: ' + Economy.getPayout(crazyeight.playerList[room].length, room) + ' ' + Economy.currency(room));
						Economy.give(crazyeight.playerData[room][crazyeight.playerList[room][0]].name, Economy.getPayout(crazyeight.playerList[room].length, room), room);
					}
					if (crazyeight.playerList[room].length < 2) {
						clearInterval(crazyeight.interval[room]);
						crazyeight.gameStatus[room] = 'off';
						return false;
					}
					//change to next player
					crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

					//pming next user their hand
					Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
					Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
					Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
				}, 90000);
		}
	},
	play: function(arg, by, room) {
		if (toId(by) !== crazyeight.currentPlayer[room] || !crazyeight.gameStatus[room] || crazyeight.gameStatus[room] !== 'on') return false;
		var suitList = ['♥', '♣', '♦', '♠'];
		var valueList = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		arg = arg.split(' ');

		if (arg[1]) {
			var modifier = arg[1].slice(0, 1).toLowerCase().replace('c', '♣').replace('h', '♥').replace('d', '♦').replace('s', '♠');
		}
		else {
			modifier = '';
		}


		var suit = arg[0].slice(0, 1).toLowerCase().replace('c', '♣').replace('h', '♥').replace('d', '♦').replace('s', '♠');
		var value = arg[0].slice(1).toUpperCase();
		if (suitList.indexOf(suit) === -1 || valueList.indexOf(value) === -1) return Bot.say(by, ',' + by, 'To play a card use the first letter of the card\'s suit + the value of the card. (ex. ' + config.commandcharacter[0] + 'play cK would be [♣K])');
		var card = suit + value;

		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.indexOf(card) === -1) {
			return Bot.say(by, room, 'You don\'t have this card!');
		}
		if (crazyeight.topCard[room].slice(1) !== value && crazyeight.topCard[room][0] !== suit && value !== '8') {
			return Bot.say(by, room, 'You can\'t play this card now.');
		}
		if (value === '8' && !modifier) {
			return Bot.say(by, room, 'Please choose what suit to change to.  Ex. ' + config.commandcharacter[0] + 'play c8 s');
		}
		if (modifier) {
			if (suitList.indexOf(modifier) === -1) {
				return Bot.say(by, room, 'Not a correct suit.');
			}
		}

		clearInterval(crazyeight.interval[room]);

		//new top card
		crazyeight.topCard[room] = card;
		Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		//remove card from hand
		//determine position of the one card
		var idx = crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.indexOf(card);
		var newHand = [];
		for (var i = 0; i < crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length; i++) {
			if (i === idx) {
				continue;
			}
			newHand.push(crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand[i]);
		}
		crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand = newHand;
		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length === 1) {
			Bot.say(config.nick, room, 'Last Card!');
		}
		//special effects;
		switch (value) {
			case '8':
				crazyeight.topCard[room] = modifier + value;
				Bot.talk(room, 'Suit is changed to: ' + modifier);
				break;
			case '2':
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
				//for loop - draw 2
				var tarPlayer = crazyeight.currentPlayer[room];
				for (var y = 0; y < 2; y++) {
					crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
					crazyeight.deck[room] = crazyeight.deck[room].slice(1);
					if (crazyeight.deck[room].length === 0) {
						crazyeight.deck[room] = Tools.generateDeck(1);
					}
				}
				Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped and is forced to draw 2 cards!');
				break;
			case 'J':
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
				Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped!');
				break;
		}
		if (crazyeight.topCard[room] === '♠Q') {
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
			//for loop - draw 4
			tarPlayer = crazyeight.currentPlayer[room];
			for (var y = 0; y < 4; y++) {
				crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
				crazyeight.deck[room] = crazyeight.deck[room].slice(1);
				if (crazyeight.deck[room].length === 0) {
					crazyeight.deck[room] = Tools.generateDeck(1);
				}
			}
			Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped and is forced to draw 4 cards!');
		}
		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length < 1) {
			Bot.say(config.nick, room, by.slice(1) + ' wins!');
			Bot.say(config.nick, room, 'Rewards: ' + Economy.getPayout(crazyeight.playerList[room].length, room) + ' ' + Economy.currency(room));
			Economy.give(crazyeight.playerData[room][crazyeight.playerList[room][0]].name, Economy.getPayout(crazyeight.playerList[room].length, room), room);
			clearInterval(crazyeight.interval[room]);
			crazyeight.gameStatus[room] = 'off';
			return;
		}

		crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
		Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
		Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
		//start new dq cycle
		crazyeight.interval[room] = setInterval(function() {
			if (crazyeight.gameStatus[room] !== 'on') {
				clearInterval(crazyeight.interval[room]);
				return false;
			}

			//disqualify for inactivity
			crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
			//re-make playerlist
			var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
			var pushPlayer = [];
			for (var x = 0; x < crazyeight.playerList[room].length; x++) {
				if (x === pIndex) {
					continue;
				}
				pushPlayer.push(crazyeight.playerList[room][x]);
			}
			//reset playerlist
			crazyeight.playerList[room] = pushPlayer;

			//checking if all players are DQ'd

			if (crazyeight.playerList[room].length === 0) {
				Bot.say(config.nick, room, 'Nobody wins this game :(');
			}
			else if (crazyeight.playerList[room].length === 1) {
				Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
				Bot.say(config.nick, room, 'Rewards: ' + Economy.getPayout(crazyeight.playerList[room].length, room) + ' ' + Economy.currency(room));
				Economy.give(crazyeight.playerData[room][crazyeight.playerList[room][0]].name, Economy.getPayout(crazyeight.playerList[room].length, room), room);
			}
			if (crazyeight.playerList[room].length < 2) {
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				return false;
			}
			//change to next player
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

			//pming next user their hand
			Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
			Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
			Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		}, 90000);
	},
	draw: function(arg, by, room) {
		if (toId(by) !== crazyeight.currentPlayer[room] || !crazyeight.gameStatus[room] || crazyeight.gameStatus[room] !== 'on') return false;
		clearInterval(crazyeight.interval[room]);
		tarPlayer = toId(by);
		crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
		crazyeight.deck[room] = crazyeight.deck[room].slice(1);
		if (crazyeight.deck[room].length === 0) {
			crazyeight.deck[room] = Tools.generateDeck(1);
		}

		Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
		//next player
		crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
		Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
		Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
		//start new dq cycle
		crazyeight.interval[room] = setInterval(function() {
			if (crazyeight.gameStatus[room] !== 'on') {
				clearInterval(crazyeight.interval[room]);
				return false;
			}

			//disqualify for inactivity
			crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
			//re-make playerlist
			var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
			var pushPlayer = [];
			for (var x = 0; x < crazyeight.playerList[room].length; x++) {
				if (x === pIndex) {
					continue;
				}
				pushPlayer.push(crazyeight.playerList[room][x]);
			}
			//reset playerlist
			crazyeight.playerList[room] = pushPlayer;

			//checking if all players are DQ'd

			if (crazyeight.playerList[room].length === 0) {
				Bot.say(config.nick, room, 'Nobody wins this game :(');
			}
			else if (crazyeight.playerList[room].length === 1) {
				Bot.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
				Bot.say(config.nick, room, 'Rewards: ' + Economy.getPayout(crazyeight.playerList[room].length, room) + ' ' + Economy.currency(room));
				Economy.give(crazyeight.playerData[room][crazyeight.playerList[room][0]].name, Economy.getPayout(crazyeight.playerList[room].length, room), room);
			}
			if (crazyeight.playerList[room].length < 2) {
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				return false;
			}
			//change to next player
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

			//pming next user their hand
			Bot.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']');
			Bot.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
			Bot.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		}, 90000);
	},
};

/****************************
 *       For C9 Users        *
 *****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals Economy */
/* globals game */
/* globals checkGame */
/* globals crazyeight */
/* globals Tools */
/* globals tarPlayer */
/* globals gameStatus */
