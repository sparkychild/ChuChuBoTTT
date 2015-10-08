exports.commands = {
    anagram: 'anagrams',
    anagrams: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        if (anagramON[room]) return false;
        anagramON[room] = true;
        anagramA[room] = '';
        anagramPoints[room] = [];
        Bot.say(by, room, 'Hosting a game of anagrams. Use +guess to submit your answer.');
        game('anagrams', room)
        anagramInterval[room] = setInterval(function() {
            if (anagramA[room]) {
                Bot.say(config.nick, room, 'The correct answer was: ' + anagramA[room]);
            }
            var AQN = Math.floor(Object.keys(wordBank).length * Math.random());
            var AnagramEntry = Object.keys(wordBank)[AQN].split('||');
            anagramA[room] = AnagramEntry[0];
            var anagramQ = anagramA[room];
            var repeatTimes = (anagramA[room].length + 2) * (anagramA[room].length + 2);
            for (var idx = 0; idx < repeatTimes; idx++) {
                var randomInt = Math.floor(Math.random() * anagramA[room].length + 1);
                anagramQ = anagramQ.slice(1, randomInt) + anagramQ.charAt(0) + anagramQ.slice(randomInt, anagramQ.length);
            }
            var text = anagramQ[0];
            for (var i = 1; i < anagramQ.length; i++) {
                text += ', ' + anagramQ[i];
            }
            Bot.talk(room, '[' + wordBank[AnagramEntry[0]] + '] ' + text);
        }, 17000);
    },
    guess: function(arg, by, room) {
        if (!anagramON[room]) return false;
        if (!toId(arg)) return false;
        if (toId(arg) !== toId(anagramA[room])) return false;
        var user = toId(by);
        if (anagramPoints[room].indexOf(user) > -1) {
            anagramA[room] = '';
            anagramPoints[room][anagramPoints[room].indexOf(user) + 1] = anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + 1;
            if (anagramPoints[room][anagramPoints[room].indexOf(user) + 1] >= 10) {
                clearInterval(anagramInterval[room]);
                Bot.say(config.nick, room, 'Congrats to ' + by + ' for winning! Reward: ' + Economy.getPayout(anagramPoints[room].length, room) + ' ' + Economy.currency(room));
                Economy.give(by, Economy.getPayout(anagramPoints[room].length, room), room)
                anagramON[room] = false;
                return false;
            }
            Bot.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + ' points!');
        }
        else {
            anagramA[room] = '';
            anagramPoints[room][anagramPoints[room].length] = user;
            anagramPoints[room][anagramPoints[room].length] = 1;
            Bot.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + ' point!');
        }
    },
    endanagram: 'endanagrams',
    endanagrams: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        clearInterval(anagramInterval[room]);
        if (!anagramON[room]) return false;
        anagramON[room] = false;
        Bot.say(by, room, 'The game of anagrams has been ended.')
    },
    anagrampoints: function(arg, by, room) {
        if (!anagramON[room]) return false;
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        var text = 'Points so far: '
        for (var i = 0; i < anagramPoints[room].length; i++) {
            text += '' + anagramPoints[room][i] + ': ';
            text += anagramPoints[room][i + 1] + ' points, ';
            i++
        }
        Bot.say(by, room, text);
    },
};