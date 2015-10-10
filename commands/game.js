exports.commands = {
    g: function(arg, by, room) {
        if (!checkGame(room)) return false;
        var game = checkGame(room)
        if (['anagram', 'trivia', 'hangman', 'kunc', 'statspread'].indexOf(game) > -1) {
            Commands['guess' + game].call(this, arg, by, room);
        }
    },
    start: function(arg, by, room) {
        if (!checkGame(room)) return false;
        var game = checkGame(room);
        if (['blackjack', 'crazyeights'].indexOf(game) > -1) {
            Commands[game].call(this, 'start', by, room);
        }
    },
    end: function(arg, by, room) {
        if (!checkGame(room)) return false;
        var game = checkGame(room);
        if (['blackjack', 'crazyeights'].indexOf(game) > -1) {
            Commands[game].call(this, 'end', by, room);
        }
        if (['anagram', 'trivia', 'hangman', 'kunc', 'statspread'].indexOf(game) > -1) {
            Commands[game + 'end'].call(this, arg, by, room);
        }
    },
    join: function(arg, by, room) {
        if (!checkGame(room)) return;
        var game = checkGame(room);
        if (['blackjack', 'crazyeights'].indexOf(game) > -1) {
            Commands[game].call(this, 'join', by, room);
        }
    },
    leave: function(arg, by, room) {
        if (!checkGame(room)) return false;
        var game = checkGame(room);
        if (['blackjack', 'crazyeights'].indexOf(game) > -1) {
            Commands[game].call(this, 'leave', by, room);
        }
    },
    skip: function(arg, by, room){
        if(!checkGame(room)) return false;
        var game = checkGame(room);
        if(['kunc', 'statspread'].indexOf(game) > -1){
            Commands[game].call(this, '', by, room, 'skip' + game)
        }
    },
    signups: function(arg, by, room){
        var game = toId(arg.split(',')[0]);
        var arg = arg.split(',').slice(1).join(',').trim();
        switch (game){
            case 'bj': case 'blackjack': case 'blowjob':
                Commands.blackjack.call(this, 'new', by, room);
                break;
            case 'crazyeights': case 'c8':
                Commands.crazyeights.call(this, 'new', by, room);
                break;
            case 'trivia':
                Commands.trivia.call(this, arg, by, room);
                break;
            case 'hangman':
                Commands.hangman.call(this, arg, by, room);
                break;
            case 'anagrams':
                Commands.anagrams.call(this, arg, by, room);
                break;
            case 'kunc':
                Commands.kunc.call(this, arg, by, room);
                break;
            case 'statspread':
                Commands.statspread.call(this, arg, by, room);
                break;
        }
    },
    randomgame: function(arg, by, room) {
        if (!Bot.canUse('randomgame', room, by)) return false;
        var gameCount = 6;
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
            case 5:
                Commands.kunc.call(this, '5', '~', room);
                break;
        }
    },
};