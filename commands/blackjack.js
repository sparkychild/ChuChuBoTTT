exports.commands = {
    bj: 'blackjack',
    blowjob: 'blackjack',
    blackjack: function(arg, by, room) {
        if (room.charAt(0) === ',') return false;
        if (!arg) return Bot.say(by, (Bot.hasRank(by, '%@#&~') ? room : ',' + by), 'The params are: new, start, join, end, leave.');
        arg = toId(arg);
        if (!gameStatus[room]) {
            gameStatus[room] = 'off';
        }
        switch (arg) {
            case 'new':
                if (!Bot.canUse('blackjack', room, by)) return false;
                if (gameStatus[room] !== 'off') return Bot.say(by, room, 'A blackjack game is already going on!');
                if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
                Bot.say(by, room, 'A new game of blackjack is starting. do +bj join to join the game!')
                game('blackjack', room);
                clearInterval(blackJack[room]);
                gameStatus[room] = 'signup';
                playerCount[room] = [];
                playerData[room] = {};
                currentPlayer[room] = '';
                break;
            case 'join':
                if (gameStatus[room] !== 'signup') return false;
                if (playerData[room][toId(by)]) {
                    return Bot.say(by, ',' + by, 'You\'ve already signed up!');
                }
                else {
                    Bot.say(by, ',' + by, 'Thank you for signing up!')
                    playerData[room][toId(by)] = {
                        name: by.slice(1),
                        hand: [],
                        total: 0,
                    }
                    playerCount[room][playerCount[room].length] = toId(by);
                }
                break;
            case 'leave':
                if (gameStatus[room] !== 'signup') return false;
                if (playerData[room][toId(by)]) {
                    delete playerData[room][toId(by)]
                    //re-make playerlist
                    var pIndex = playerCount[room].indexOf(toId(by));
                    var pushPlayer = [];
                    for (var x = 0; x < playerCount[room].length; x++) {
                        if (x === pIndex) {
                            continue;
                        }
                        pushPlayer.push(playerCount[room][x]);
                    }
                    //reset playerlist
                    playerCount[room] = pushPlayer;
                    Bot.say(by, ',' + by, 'Aww, next time then!')
                }
                break;
            case 'start':
                if (!Bot.canUse('blackjack', room, by)) return false;
                if (gameStatus[room] !== 'signup') return false;
                if (!playerCount[room] || playerCount[room].length === 0) return Bot.say(by, room, 'No one has joined yet ;-;')
                gameStatus[room] = 'on';
                clearInterval(blackJack[room]);
                deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);

                //dealers stuff/
                playerData[room][toId(config.nick)] = {
                    name: config.nick,
                    hand: [],
                    total: 0,
                };

                //determine who goes first
                currentPlayer[room] = playerCount[room][0];
                //deal the cards
                for (var i = 0; i < 2; i++) {
                    for (var j = 0; j < playerCount[room].length; j++) {
                        //hand out the cards
                        var targetPlayer = playerCount[room][j];
                        var handSize = playerData[room][targetPlayer].hand.length;
                        playerData[room][targetPlayer].hand[handSize] = deck[room][0];
                        playerData[room][targetPlayer].total = Tools.parseHandTotal(playerData[room][targetPlayer].hand);
                        deck[room] = deck[room].slice(1);
                        if (deck[room].length === 0) {
                            deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                        }
                        //say top card
                        if (i === 0) {
                            Bot.talk(room, 'Top Card - ' + playerData[room][playerCount[room][j]].name + ': [' + playerData[room][playerCount[room][j]].hand[0] + ']')
                        }
                    }
                    //dealers card
                    targetPlayer = toId(config.nick);
                    var handSize = playerData[room][targetPlayer].hand.length;
                    playerData[room][targetPlayer].hand[handSize] = deck[room][0];
                    playerData[room][targetPlayer].total = Tools.parseHandTotal(playerData[room][targetPlayer].hand);
                    deck[room] = deck[room].slice(1);
                    if (deck[room].length === 0) {
                        deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                    }
                    //say top card
                    if (i === 0) {
                        Bot.talk(room, '**Dealer\'s Top Card: [' + playerData[room][targetPlayer].hand[0] + ']**')
                    }

                }

                //old deal
                /*
				playerData[room][currentPlayer[room]].hand = deck[room].slice(0, 2);
				deck[room] = deck[room].slice(2);
				*/
                Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__')
                Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total);
                //start the turns
                blackJack[room] = setInterval(function() {
                    if (gameStatus[room] !== 'on') {
                        clearInterval(blackJack[room]);
                        return false;
                    }
                    if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
                        clearInterval(blackJack[room]);
                        //code for summing up, dealer stuff
                        Bot.say(config.nick, room, 'Dealer\'s turn now...');
                        //drawing until over 17
                        for (var i = 0; i < 17; i++) {
                            if (playerData[room][toId(config.nick)].total < 17) {
                                var handSize = playerData[room][toId(config.nick)].hand.length;
                                playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
                                playerData[room][toId(config.nick)].total = Tools.parseHandTotal(playerData[room][toId(config.nick)].hand);
                                deck[room] = deck[room].slice(1);
                                if (deck[room].length === 0) {
                                    deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                                }
                            }
                            else {
                                break;
                            }
                        }
                        //conclusion of winners
                        //naturals
                        var naturals = [];
                        for (var players = 0; players < playerCount[room].length; players++) {
                            var tarPlayer = playerCount[room][players]
                            if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
                                naturals.push(playerData[room][tarPlayer].name);
                            }
                        }
                        var winnerList = []
                        if (playerData[room][toId(config.nick)].total > 21) {
                            Bot.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
                            for (var players = 0; players < playerCount[room].length; players++) {
                                var tarPlayer = playerCount[room][players]
                                if (playerData[room][tarPlayer].total < 22) {
                                    winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                                }
                            }
                        }
                        else if (playerData[room][toId(config.nick)].total === 21) {
                            gameStatus[room] = 'off';
                            Bot.say(config.nick, room, 'The Dealer has a BlackJack!')
                        }
                        else {
                            Bot.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
                            for (var players = 0; players < playerCount[room].length; players++) {
                                var tarPlayer = playerCount[room][players]
                                if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
                                    winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                                }
                            }
                        }
                        gameStatus[room] = 'off';
                        clearInterval(blackJack[room]);
                        if (naturals[0]) {
                            Bot.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', ') + ' - and recieve an extra ' + Economy.getPayout(3, room) + ' ' + Economy.currency(room) + '.');
                            Economy.give(naturals, Economy.getPayout(3, room), room);
                        }
                        if (winnerList[0]) {
                            Economy.give(winnerList, Economy.getPayout(5, room), room);
                        }
                        return Bot.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') + '. Rewards: ' + Economy.getPayout(5, room) + ' ' + Economy.currency(room) : 'Sorry, no winners this time.'))
                    }
                    else {
                        currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
                        Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__')
                        Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
                    }
                }, 90000);
                break;
            case 'end':
                if (!Bot.canUse('blackjack', room, by)) return false;
                if (gameStatus[room] === 'off') return false;
                clearInterval(blackJack[room]);
                Bot.say(by, room, 'The game of Blackjack was forcibly ended.')
                gameStatus[room] = 'off';
        }
    },

    hit: function(arg, by, room) {
        if (toId(by) !== currentPlayer[room]) return false;
        if (!gameStatus[room] || gameStatus[room] !== 'on' || room.charAt(0) === ',') return false;
        //deal one more card
        var handSize = playerData[room][currentPlayer[room]].hand.length;
        playerData[room][currentPlayer[room]].hand[handSize] = deck[room][0];
        playerData[room][currentPlayer[room]].total = Tools.parseHandTotal(playerData[room][currentPlayer[room]].hand);
        deck[room] = deck[room].slice(1);
        if (deck[room].length === 0) {
            deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
        }
        Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)

        if (playerData[room][currentPlayer[room]].total > 21) {
            clearInterval(blackJack[room]);
            Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + ' has busted with ' + playerData[room][currentPlayer[room]].total + '!')
            if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
                if (gameStatus[room] !== 'on') {
                    clearInterval(blackJack[room]);
                    return false;
                }
                clearInterval(blackJack[room]);
                //code for summing up, dealer stuff
                //drawing until over 17
                for (var i = 0; i < 17; i++) {
                    if (playerData[room][toId(config.nick)].total < 17) {
                        var handSize = playerData[room][toId(config.nick)].hand.length;
                        playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
                        playerData[room][toId(config.nick)].total = Tools.parseHandTotal(playerData[room][toId(config.nick)].hand);
                        deck[room] = deck[room].slice(1);
                        if (deck[room].length === 0) {
                            deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                        }
                    }
                    else {
                        break;
                    }
                }
                //conclusion of winners
                //naturals
                var naturals = [];
                for (var players = 0; players < playerCount[room].length; players++) {
                    var tarPlayer = playerCount[room][players]
                    if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
                        naturals.push(playerData[room][tarPlayer].name);
                    }
                };
                var winnerList = []
                if (playerData[room][toId(config.nick)].total > 21) {
                    Bot.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
                    for (var players = 0; players < playerCount[room].length; players++) {
                        var tarPlayer = playerCount[room][players]
                        if (playerData[room][tarPlayer].total < 22) {
                            winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                        }
                    }
                }
                else if (playerData[room][toId(config.nick)].total === 21) {
                    gameStatus[room] = 'off';
                    Bot.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
                }
                else {
                    Bot.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
                    for (var players = 0; players < playerCount[room].length; players++) {
                        var tarPlayer = playerCount[room][players]
                        if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
                            winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                        }
                    }
                }
                gameStatus[room] = 'off';
                if (naturals[0]) {
                    Bot.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', ') + ' - and recieve an extra ' + Economy.getPayout(3, room) + ' ' + Economy.currency(room) + '.');
                    Economy.give(naturals, Economy.getPayout(3, room), room);
                }
                if (winnerList[0]) {
                    Economy.give(winnerList, Economy.getPayout(5, room), room);
                }
                return Bot.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') + '. Rewards: ' + Economy.getPayout(5, room) + ' ' + Economy.currency(room) : 'Sorry, no winners this time.'))
                clearInterval(blackJack[room]);
            }
            else {
                currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
                Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
                Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
            }

            blackJack[room] = setInterval(function() {
                if (gameStatus[room] !== 'on') {
                    clearInterval(blackJack[room]);
                    return false;
                }
                if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
                    clearInterval(blackJack[room]);
                    //code for summing up, dealer stuff
                    Bot.say(config.nick, room, 'Dealer\'s turn now...');
                    //drawing until over 17
                    for (var i = 0; i < 17; i++) {
                        if (playerData[room][toId(config.nick)].total < 17) {
                            var handSize = playerData[room][toId(config.nick)].hand.length;
                            playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
                            playerData[room][toId(config.nick)].total = Tools.parseHandTotal(playerData[room][toId(config.nick)].hand);
                            deck[room] = deck[room].slice(1);
                            if (deck[room].length === 0) {
                                deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                            }
                        }
                        else {
                            break;
                        }
                    }
                    //conclusion of winners
                    //naturals
                    var naturals = [];
                    for (var players = 0; players < playerCount[room].length; players++) {
                        var tarPlayer = playerCount[room][players]
                        if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
                            naturals.push(playerData[room][tarPlayer].name);
                        }
                    };
                    var winnerList = []
                    if (playerData[room][toId(config.nick)].total > 21) {
                        Bot.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
                        for (var players = 0; players < playerCount[room].length; players++) {
                            var tarPlayer = playerCount[room][players]
                            if (playerData[room][tarPlayer].total < 22) {
                                winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                            }
                        }
                    }
                    else if (playerData[room][toId(config.nick)].total === 21) {
                        gameStatus[room] = 'off';
                        Bot.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
                    }

                    else {
                        Bot.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
                        for (var players = 0; players < playerCount[room].length; players++) {
                            var tarPlayer = playerCount[room][players]
                            if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
                                winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                            }
                        }
                    }
                    gameStatus[room] = 'off';
                    clearInterval(blackJack[room]);
                    if (naturals[0]) {
                        Bot.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', ') + ' - and recieve an extra ' + Economy.getPayout(3, room) + ' ' + Economy.currency(room) + '.');
                        Economy.give(naturals, Economy.getPayout(3, room), room);
                    }
                    if (winnerList[0]) {
                        Economy.give(winnerList, Economy.getPayout(5, room), room);
                    }
                    return Bot.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') + '. Rewards: ' + Economy.getPayout(5, room) + ' ' + Economy.currency(room) : 'Sorry, no winners this time.'))
                }
                else {
                    currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
                    Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
                    Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
                }
            }, 90000);
        }
    },
    stay: function(arg, by, room) {
        if (toId(by) !== currentPlayer[room]) return false;
        if (!gameStatus[room] || gameStatus[room] !== 'on' || room.charAt(0) === ',') return false;

        if (playerData[room][currentPlayer[room]].total === 21) {
            Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + ' has a Blackjack!');
        }

        clearInterval(blackJack[room]);

        if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
            if (gameStatus[room] !== 'on') {
                clearInterval(blackJack[room]);
                return false;
            }
            clearInterval(blackJack[room]);
            //code for summing up, dealer stuff
            //drawing until over 17
            for (var i = 0; i < 17; i++) {
                if (playerData[room][toId(config.nick)].total < 17) {
                    var handSize = playerData[room][toId(config.nick)].hand.length;
                    playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
                    playerData[room][toId(config.nick)].total = Tools.parseHandTotal(playerData[room][toId(config.nick)].hand);
                    deck[room] = deck[room].slice(1);
                    if (deck[room].length === 0) {
                        deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                    }
                }
                else {
                    break;
                }
            }
            //conclusion of winners
            //naturals
            var naturals = [];
            for (var players = 0; players < playerCount[room].length; players++) {
                var tarPlayer = playerCount[room][players]
                if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
                    naturals.push(playerData[room][tarPlayer].name);
                }
            };
            var winnerList = []
            if (playerData[room][toId(config.nick)].total > 21) {
                Bot.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
                for (var players = 0; players < playerCount[room].length; players++) {
                    var tarPlayer = playerCount[room][players]
                    if (playerData[room][tarPlayer].total < 22) {
                        winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                    }
                }
            }
            else if (playerData[room][toId(config.nick)].total === 21) {
                gameStatus[room] = 'off';
                Bot.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
            }
            else {
                Bot.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total)
                for (var players = 0; players < playerCount[room].length; players++) {
                    var tarPlayer = playerCount[room][players]
                    if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
                        winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                    }
                }
            }
            gameStatus[room] = 'off';
            if (naturals[0]) {
                Bot.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', ') + ' - and recieve an extra ' + Economy.getPayout(3, room) + ' ' + Economy.currency(room) + '.');
                Economy.give(naturals, Economy.getPayout(3, room), room);
            }
            if (winnerList[0]) {
                Economy.give(winnerList, Economy.getPayout(5, room), room);
            }
            return Bot.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') + '. Rewards: ' + Economy.getPayout(5, room) + ' ' + Economy.currency(room) : 'Sorry, no winners this time.'))
        }
        else {
            currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
            Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
            Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
        }


        clearInterval(blackJack[room]);

        blackJack[room] = setInterval(function() {
            if (gameStatus[room] !== 'on') {
                clearInterval(blackJack[room]);
                return false;
            }
            if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
                clearInterval(blackJack[room]);
                //code for summing up, dealer stuff
                Bot.say(config.nick, room, 'Dealer\'s turn now...');
                //drawing until over 17

                for (var i = 0; i < 17; i++) {
                    if (playerData[room][toId(config.nick)].total < 17) {
                        var handSize = playerData[room][toId(config.nick)].hand.length;
                        playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
                        playerData[room][toId(config.nick)].total = Tools.parseHandTotal(playerData[room][toId(config.nick)].hand);
                        deck[room] = deck[room].slice(1);
                        if (deck[room].length === 0) {
                            deck[room] = Tools.generateDeck(~~(playerCount[room].length / 10) + 1);
                        }
                    }
                    else {
                        break;
                    }
                }
                //conclusion of winners
                //naturals
                var naturals = [];
                for (var players = 0; players < playerCount[room].length; players++) {
                    var tarPlayer = playerCount[room][players]
                    if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
                        naturals.push(playerData[room][tarPlayer].name);
                    }
                };
                var winnerList = []
                if (playerData[room][toId(config.nick)].total > 21) {
                    Bot.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
                    for (var players = 0; players < playerCount[room].length; players++) {
                        var tarPlayer = playerCount[room][players]
                        if (playerData[room][tarPlayer].total < 22) {
                            winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                        }
                    }
                }
                else if (playerData[room][toId(config.nick)].total === 21) {
                    gameStatus[room] = 'off';

                    Bot.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!');
                }
                else {
                    Bot.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
                    for (var players = 0; players < playerCount[room].length; players++) {
                        var tarPlayer = playerCount[room][players]
                        if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
                            winnerList[winnerList.length] = playerData[room][tarPlayer].name;
                        }
                    }
                }
                gameStatus[room] = 'off';
                if (naturals[0]) {
                    Bot.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', ') + ' - and recieve an extra ' + Economy.getPayout(3, room) + ' ' + Economy.currency(room) + '.');
                    Economy.give(naturals, Economy.getPayout(3, room), room);
                }
                if (winnerList[0]) {
                    Economy.give(winnerList, Economy.getPayout(5, room), room);
                }
                return Bot.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') + '. Rewards: ' + Economy.getPayout(5, room) + ' ' + Economy.currency(room) : 'Sorry, no winners this time.'))
                clearInterval(blackJack[room]);
            }
            else {
                currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
                Bot.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
                Bot.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
            }
        }, 90000);
    },
}