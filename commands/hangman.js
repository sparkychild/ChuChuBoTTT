//interval for posting hangman is **8 seconds**
function formatHangman(word, guesses) {
    var returnHangman = '';
    for (var i = 0; i < word.length; i++) {
        if (/[^A-Za-z0-9\s]/i.test(word[i])) {
            returnHangman += word[i] + ' ';
        }
        else if (word[i] === ' ') {
            returnHangman += '/ ';
        }
        else {
            if (guesses.indexOf(toId(word[i])) > -1) {
                returnHangman += word[i] + ' '
            }
            else {
                returnHangman += '_ ';
            }
        }
    }
    returnHangman += '| [' + wordBank[word] + '] | ';
    for (var i = 0; i < guesses.length; i++) {
        if (guesses[i].length > 1) {
            returnHangman += guesses[i] + ' ';
        }
        else {
            if (word.indexOf(guesses[i]) === -1) {
                returnHangman += guesses[i] + ' ';
            }
        }
    }
    return returnHangman.trim();
}
exports.commands = {
    hangman: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('hangman', room, by)) return false;
        if (hangman.on[room]) {
            return Bot.say(by, room, 'Repost: ' + formatHangman(hangman.word[room], hangman.guesses[room]));
        }
        if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
        //select a word:
        hangman.word[room] = Object.keys(wordBank)[~~(Object.keys(wordBank).length * Math.random())];
        Bot.say(by, room, 'Hosting a game of Hangman. Use ' + config.commandcharacter[0] + 'g to guess.');
        //init the variables
        hangman.guesses[room] = [];
        hangman.on[room] = true;
        hangman.post[room] = Date.now();
        hangman.queue[room] = false;
        Bot.talk(room, formatHangman(hangman.word[room], hangman.guesses[room]));
    },
    endhangman: 'hangmanend',
    hangmanend: function(arg, by, room) {
        if (room.charAt(',') === 0) return false;
        if (!Bot.canUse('hangman', room, by)) return false;
        if (!hangman.on[room]) return false;
        delete hangman.on[room];
        Bot.say(by, room, 'The game of hangman has been ended. The answer was ' + hangman.word[room] + '.');
    },
    guesshangman: function(arg, by, room) {
        if (!hangman.on[room]) return false;
        if (!arg || !toId(arg)) return false;
        arg = toId(arg);
        if (hangman.guesses[room].indexOf(arg) > -1) return false;
        if (arg.length !== 1) {
            if (arg === toId(hangman.word[room])) {
                //declare winner
                delete hangman.on[room];
                var payout = Economy.getPayout(2, room);
                Economy.give(by, payout, room);
                clearTimeout(hangman.timer[room]);
                return Bot.say(by, room, 'Congratulations, ' + by.slice(1) + ' has won the game and recieves  ' + payout + ' ' + Economy.currency(room) + '! The correct answer was: ' + hangman.word[room]);
            }
            else {
                hangman.guesses[room].push(arg);
                if (formatHangman(hangman.word[room], hangman.guesses[room]).split('] | ')[1] && formatHangman(hangman.word[room], hangman.guesses[room]).split('] | ')[1].split(' ').length >= 12) {
                    delete hangman.on[room];
                    clearTimeout(hangman.timer[room]);
                    return Bot.say(by, room, 'RIP the man died! The correct answer was: ' + hangman.word[room]);
                }
                if (Date.now() - hangman.post[room] >= 8000) {
                    Bot.talk(room, formatHangman(hangman.word[room], hangman.guesses[room]));
                    hangman.post[room] = Date.now();
                }
                else if (!hangman.queue[room]) {
                    hangman.queue[room] = true;
                    hangman.timer[room] = setTimeout(function() {
                        Bot.talk(room, formatHangman(hangman.word[room], hangman.guesses[room]));
                        hangman.queue[room] = false;
                        hangman.post[room] = Date.now();
                    }, 8000 - (Date.now() - hangman.post[room]));
                }
            }
        }
        else {
            hangman.guesses[room].push(arg);
            //cheat way to check for all the letters
            if (formatHangman(hangman.word[room], hangman.guesses[room]).indexOf('_') === -1) {
                //declare winner
                delete hangman.on[room];
                var payout = Economy.getPayout(2, room);
                Economy.give(by, payout, room);
                return Bot.say(by, room, 'Congratulations, ' + by.slice(1) + ' has won the game and recieves  ' + payout + ' ' + Economy.currency(room) + '! The correct answer was: ' + hangman.word[room])
                clearTimeout(hangman.timer[room]);
            }
            //determine if the man is dead?
            if (formatHangman(hangman.word[room], hangman.guesses[room]).split('] | ')[1] && formatHangman(hangman.word[room], hangman.guesses[room]).split('] | ')[1].split(' ').length >= 12) {
                delete hangman.on[room];
                clearTimeout(hangman.timer[room]);
                return Bot.say(by, room, 'RIP the man died! The correct answer was: ' + hangman.word[room]);
            }
            //else post the stuff
            if (Date.now() - hangman.post[room] >= 8000) {
                Bot.talk(room, formatHangman(hangman.word[room], hangman.guesses[room]));
                hangman.post[room] = Date.now();
            }
            else if (!hangman.queue[room]) {
                hangman.queue[room] = true;
                hangman.timer[room] = setTimeout(function() {
                    Bot.talk(room, formatHangman(hangman.word[room], hangman.guesses[room]));
                    hangman.queue[room] = false;
                    hangman.post[room] = Date.now();
                }, 8000 - (Date.now() - hangman.post[room]));
            }
        }
    }
};

/****************************
 *       For C9 Users        *
 *****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals hangman */
/* globals Economy */
/* globals game */
/* globals checkGame */
/* globals wordBank */
