exports.commands = {
    resetroom: function(arg, by, room, cmd) {
        if (cmd) return false;
        if (hangmanON[room]) {
            clearInterval(hangmanInterval[room]);
            delete hangmanON[room];
            ok('Reset hangman game in ' + room);
        }
        if (triviaON[room]) {
            clearInterval(triviaTimer[room]);
            delete triviaON[room];
            ok('Reset trivia game in ' + room);

        }
        if (anagramON[room]) {
            clearInterval(anagramInterval[room]);
            delete anagramON[room];
            ok('Reset anagrams game in ' + room);

        }
        if (gameStatus[room] && gameStatus[room] !== 'off') {
            delete gameStatus[room];
            clearInterval(blackJack[room]);
            ok('Reset blackjack game in ' + room);

        }
        if (crazyeight.gameStatus[room] && crazyeight.gameStatus[room] !== 'off') {
            delete crazyeight.gameStatus[room];
            clearInterval(crazyeight.interval[room]);
            ok('Reset crazyeights game in ' + room);

        }
        if (kunc.on[room]) {
            delete kunc.on[room];
            ok('Reset kunc game in ' + room);
        }
        if(statspread.on[room]){
            delete statspread.on[room];
            ok('Reset StatSpread game in ' + room);
        }
        if (Bot.repeatON[room]) {
            delete Bot.repeatON[room];
            clearInterval(Bot.repeatText[room]);
            ok('Reset repeat in ' + room);
        }
        if(timer.on[room]){
            delete timer.on[room];
            clearTimeout(timer.repeat[room]);
            ok('Reset timer in ' + room);
        }
    },
    clearstatus: function(arg, by, room, cmd) {
        if (cmd) return false;
        for (var tarRoom in triviaON) {
            if (triviaON[tarRoom]) {
                clearInterval(triviaTimer[tarRoom]);
                delete triviaON[tarRoom];
                ok('Reset trivia game in ' + tarRoom);
            }
        }
        for (var tarRoom in hangmanON) {
            if (hangmanON[tarRoom]) {
                clearInterval(hangmanInterval[tarRoom]);
                delete hangmanON[tarRoom];
                ok('Reset hangman game in ' + tarRoom);
            }
        }
        for (var tarRoom in anagramON) {
            if (anagramON[tarRoom]) {
                clearInterval(anagramON[tarRoom]);
                delete anagramON[tarRoom];
                ok('Reset anagram game in ' + tarRoom);
            }
        }
        for (var tarRoom in gameStatus) {
            if (gameStatus[tarRoom] !== 'off') {
                clearInterval(blackJack[tarRoom]);
                delete gameStatus[tarRoom];
                ok('Reset blackjack game in ' + tarRoom);
            }
        }
        for (var tarRoom in crazyeight.gameStatus) {
            if (crazyeight.gameStatus[tarRoom] !== 'off') {
                clearInterval(crazyeight.interval[tarRoom]);
                delete(crazyeight.gameStatus[tarRoom]);
                ok('Reset crazyeights game in ' + tarRoom);
            }
        }
        for (var tarRoom in kunc.on) {
            delete kunc.on[tarRoom];
            ok('Reset kunc game in ' + tarRoom);
        }
        for (var tarRoom in statspread.on) {
            delete statspread.on[tarRoom];
            ok('Reset StatSpread game in ' + tarRoom);
        }
        for (var tarRoom in Bot.repeatON) {
            if (Bot.repeatON[tarRoom]) {
                clearInterval(Bot.repeatText[tarRoom]);
                delete Bot.repeatON[tarRoom];
                ok('Reset repeat in ' + tarRoom);
            }
        }
        for(var tarRoom in timer.on){
            clearTimeout(timer.repeat[tarRoom])
            delete timer.on[tarRoom];
            ok('Reset tier in ' + tarRoom)
        }
    },
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals Bot */
/* globals kunc */
/* globals statspread */
/* globals crazyeight */
/* globals gameStatus */
/* globals anagramON */
/* globals ok */
/* globals blackJack */
/* globals triviaON */
/* globals hangmanON */
/* globals hangmanInterval */
/* globals triviaTimer */
/* globals anagramInterval */
/* globals timer */
