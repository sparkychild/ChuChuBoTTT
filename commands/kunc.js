var Movedex = isolate(MOVEDEX);

function scramble(array) {
    var aLength = array.length;
    var returnArray = [];
    for (var i = 0; i < aLength; i++) {
        var rand = ~~(Math.random() * array.length);
        returnArray.push(array[rand]);
        array.splice(rand, 1);
    }
    return returnArray;
}

function createMoveset(target) {
    //pokemonData
    var allMoves = scramble(JSON.parse(JSON.stringify(pokemonData[target].randomBattleMoves)));
    if (allMoves.length <= 4) {
        return allMoves;
    }
    var selectedMoves = [];
    var damagingTypes = [];
    var boostingMove = 0;
    //search boosting move
    function sum(array) {
        var total = 0;
        for (var i = 0; i < array.length; i++) {
            total += array[i];
        }
        return total;
    }

    function isBoostingMove(move) {
        if (Movedex[move].boosts && sum(Object.values(Movedex[move].boosts)) >= 2) {
            return true;
        }
        return false;
    }
    for (var i = 0; i < allMoves.length; i++) {
        if (isBoostingMove(allMoves[i])) {
            var rand = Math.random();
            if (rand >= 0.7) {
                break;
            }
            selectedMoves.push(allMoves[i]);
            boostingMove = 1;
            break;
        }
    }
    for (var i = 0; i < allMoves.length; i++) {
        if (boostingMove) {
            if (selectedMoves.length >= 4) {
                break;
            }
        }
        else {
            if (selectedMoves.length >= 2) {
                break;
            }
        }
        var tarMove = allMoves[i];
        var tarType = Movedex[tarMove].type;
        if (Movedex[tarMove].basePower === 0) {
            continue;
        }
        if (selectedMoves.indexOf(allMoves[i]) > -1) {
            continue;
        }
        if (selectedMoves.join('').indexOf('hiddenpower') > -1 && tarMove.substr(0, 11) === 'hiddenpower') {
            continue;
        }
        if (damagingTypes.indexOf(tarType) > -1 && ['uturn', 'voltswitch'].indexOf(tarMove) === -1) {
            continue;
        }
        //add the data
        selectedMoves.push(tarMove);
        damagingTypes.push(tarType);
    }
    //add non damaging moves
    for (var i = 0; i < allMoves.length; i++) {
        if (selectedMoves.length >= 4) {
            break;
        }
        if (selectedMoves.indexOf(allMoves[i]) > -1) {
            continue;
        }
        if (selectedMoves.join('').indexOf('hiddenpower') > -1 && allMoves[i].substr(0, 11) === 'hiddenpower') {
            continue;
        }
        selectedMoves.push(allMoves[i]);
    }
    return selectedMoves;
}
//end of select moves functions
function formatMoves(array) {
    var returnMoves = [];
    for (var i = 0; i < array.length; i++) {
        if (!array[i]) continue;
        returnMoves.push(Movedex[toId(array[i])].name);
    }
    return returnMoves;
}
var Pokedex = isolate(POKEDEX);

exports.commands = {
    //kunc game
    skipkunc: 'kunc',
    kunc: function(arg, by, room, cmd) {
        if (!Bot.canUse('kunc', room, by) || room.charAt(0) === ',') return false;
        if (cmd === 'sk') {
            if (!kunc.on[room]) return false;
            var tarAnswer = Pokedex[kunc.answer[room]].species;
            Bot.say(by, room, 'The correct answer was ' + tarAnswer);
        }
        if (kunc.on[room] && cmd === 'kunc') return Bot.say(by, room, kunc.question[room]);
        if (cmd === 'kunc') {
            if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
            game('kunc', room);
            kunc.on[room] = true;
            if (!arg) {
                kunc.scorecap[room] = 1;
            }
            else {
                var cap = arg.replace(/[^0-9]/g, '');
                if (!cap) {
                    kunc.scorecap[room] = 1;
                }
                else {
                    kunc.scorecap[room] = cap * 1;
                    Bot.say(by, room, 'Hosting a game of \'kunc\', a game originating from IRC.  Guess the Pokémon that has this moveset and you get one point. First player to ' + cap + ' points wins!');
                }
            }
            kunc.points[room] = {};
        }
        //now the real part;
        //choose the random pokemon
        var allMons = Object.keys(pokemonData);

        kunc.question[room] = '';
        while (!kunc.question[room]) {
            kunc.answer[room] = allMons[~~(allMons.length * Math.random())];
            try {
                kunc.question[room] = '``Moveset: ' + formatMoves(createMoveset(kunc.answer[room])).join(', ') + '.`` Use ' + config.commandcharacter[0] + 'g to guess the Pokemon.';
            }
            catch (e) {
                console.log('failed to generate kunc moveset.');
            }
        }
        //special case for arceus bc this gets dumb
        if (kunc.answer[room].substr(0, 8) === 'genesect') {
            kunc.answer[room] = 'genesect';
        }
        if (kunc.answer[room].substr(0, 6) === 'arceus') {
            kunc.answer[room] = 'arceus';
        }
        Bot.say(by, room, kunc.question[room]);
    },
    gk: 'guesskunc',
    guesskunc: function(arg, by, room) {
        if (!kunc.on[room] || !arg) return false;
        var userid = toId(by);
        if (toId(arg) === kunc.answer[room]) {
            if (!kunc.points[room][userid]) {
                kunc.points[room][userid] = 0;
            }
            kunc.points[room][userid]++;
            if (kunc.points[room][userid] >= kunc.scorecap[room]) {
                delete kunc.on[room];
                Economy.give(by, Economy.getPayout(kunc.scorecap[room], room), room);
                return Bot.say(by, room, by.slice(1) + ' has won the game! Rewards: ' + Economy.getPayout(kunc.scorecap[room], room) + ' ' + Economy.currency(room));
            }
            Bot.say(config.nick, room, by.slice(1) + ' has the correct answer and now has ' + kunc.points[room][userid] + ' points!');
            //choose the random pokemon
            var allMons = Object.keys(pokemonData);

            kunc.question[room] = '';
            while (!kunc.question[room]) {
                kunc.answer[room] = allMons[~~(allMons.length * Math.random())];
                try {
                    kunc.question[room] = '``Moveset: ' + formatMoves(createMoveset(kunc.answer[room])).join(', ') + '.`` Use ' + config.commandcharacter[0] + 'gk to guess the Pokemon.';
                }
                catch (e) {
                    console.log('failed to generate kunc moveset.');
                }
            }
            //special case for arceus bc this gets dumb
            if (kunc.answer[room].substr(0, 8) === 'genesect') {
                kunc.answer[room] = 'genesect';
            }
            if (kunc.answer[room].substr(0, 6) === 'arceus') {
                kunc.answer[room] = 'arceus';
            }
            Bot.say(by, room, kunc.question[room]);
        }
    },
    endkunc: 'kuncend',
    kuncend: function(arg, by, room) {
        if (!Bot.canUse('kunc', room, by) || !kunc.on[room]) return false;
        delete kunc.on[room];
        var tarAnswer = Pokedex[kunc.answer[room]].species;
        return Bot.say(by, room, 'The game of kunc has ended. The correct answer is: ' + tarAnswer);
    }
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals kunc */
/* globals pokemonData */
/* globals Economy */
/* globals isolate */
/* globals POKEDEX */
/* globals checkGame */
/* globals game */
/* globals MOVEDEX */
