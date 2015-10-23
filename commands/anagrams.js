exports.commands = {
    anagram: 'anagrams',
    anagrams: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        if (anagramON[room]) return false;
        if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
        anagramON[room] = true;
        anagramA[room] = '';
        anagramPoints[room] = {};
        if (!arg) {
            anagramScorecap[room] = 5;
        }
        else {
            var cap = arg.replace(/[^0-9]/g, '');
            if (cap) {
                anagramScorecap[room] = cap * 1;
            }
            else {
                anagramScorecap[room] = 5;
            }
        }
        Bot.say(by, room, 'Hosting a game of anagrams. Use ' + config.commandcharacter[0] + 'g to submit your answer. First to ' + anagramScorecap[room] + ' points wins!');
        game('anagrams', room);
        anagramInterval[room] = setInterval(function() {
            if (anagramA[room]) {
                Bot.say(config.nick, room, 'The correct answer was: ' + anagramA[room]);
            }
            var AQN = Math.floor(Object.keys(wordBank).length * Math.random());
            var AnagramEntry = Object.keys(wordBank)[AQN];
            anagramA[room] = AnagramEntry;
            var anagramQ = toId(anagramA[room]);
            var repeatTimes = (anagramA[room].length + 2) * (anagramA[room].length + 2);
            for (var idx = 0; idx < repeatTimes; idx++) {
                var randomInt = Math.floor(Math.random() * anagramA[room].length + 1);
                anagramQ = anagramQ.slice(1, randomInt) + anagramQ.charAt(0) + anagramQ.slice(randomInt, anagramQ.length);
            }
            var text = anagramQ[0];
            for (var i = 1; i < anagramQ.length; i++) {
                text += ', ' + anagramQ[i];
            }
            Bot.talk(room, '[' + wordBank[anagramA[room]] + '] ' + text);
        }, 17000);
    },
    guessanagram: function(arg, by, room) {
        if (!anagramON[room]) return false;
        if (!toId(arg)) return false;
        if (toId(arg) !== toId(anagramA[room])) return false;
        var user = toId(by);
        anagramA[room] = '';
        if (!anagramPoints[room][user]) {
            anagramPoints[room][user] = 0;
        }
        anagramPoints[room][user]++;
        if (anagramPoints[room][user] >= anagramScorecap[room]) {
            Bot.say(config.nick, room, 'Congrats to ' + by + ' for winning! Reward: ' + Economy.getPayout((Object.keys(anagramPoints[room]).length * anagramScorecap[room]), room) + ' ' + Economy.currency(room));
            Economy.give(by, Economy.getPayout((Object.keys(anagramPoints[room]).length * anagramScorecap[room]), room)  , room);
            delete anagramON[room];
            clearInterval(anagramInterval[room]);
            return;
        }
        Bot.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + anagramPoints[room][toId(by)] + ' points!');
    },
    endanagram: 'endanagrams',
    anagramend: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        clearInterval(anagramInterval[room]);
        if (!anagramON[room]) return false;
        anagramON[room] = false;
        Bot.say(by, room, 'The game of anagrams has been ended.');
    },
    anagrampoints: function(arg, by, room) {
        if (!anagramON[room]) return false;
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('anagrams', room, by)) return false;
        var text = 'Points so far: ';
        for (var i in anagramPoints[room]) {
            text += i + ' - ' + anagramPoints[room][i] + ' points, ';
        }
        Bot.say(by, room, text);
    },
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals anagramPoints */
/* globals anagramON */
/* globals anagramInterval */
/* globals Economy */
/* globals anagramScorecap */
/* globals anagramA */
/* globals wordBank */
/* globals game */
/* globals checkGame */
