function findSimilarBST(object) {
    var returnPoke = [];
    for (var i in POKEDEX) {
        if (POKEDEX[i].baseStats.atk === object.atk && POKEDEX[i].baseStats.hp === object.hp && POKEDEX[i].baseStats.def === object.def && POKEDEX[i].baseStats.spa === object.spa && POKEDEX[i].baseStats.spd === object.spd && POKEDEX[i].baseStats.spe === object.spe) {
            returnPoke.push(i);
        }
    }
    return returnPoke;
}

function formatAnswer(array) {
    var returnString = [];
    for (var i = 0; i < array.length; i++) {
        returnString.push(POKEDEX[array[i]].species);
    }
    return returnString.join(', ');
}
exports.commands = {
    skipstatspread: 'statspread',
    ss: 'statspread',
    statspread: function(arg, by, room, cmd) {
        if (!Bot.canUse('statspread', room, by) || room.charAt(0) === ',') return false;
        if (checkGame(room) && cmd !== 'skipss') return Bot.say(by, room, 'There is already a game going on in this room!');
        if (cmd === 'skipss' && !statspread.on[room]) return;
        if (cmd !== 'skipss') {
            if (!arg) {
                statspread.score[room] = {};
                statspread.scorecap[room] = 3;
                Bot.say(by, room, 'Hosting a game of "Stat Spread".  Simply guess which Pokémon has this stat spread. First to ' + statspread.scorecap[room] + ' points wins!');
            }
            else {
                statspread.score[room] = {};
                var cap = arg.replace(/[^0-9]/g, '');
                if (cap) {
                    statspread.scorecap[room] = cap * 1;
                }
                else {
                    statspread.scorecap[room] = 3;
                }
                Bot.say(by, room, 'Hosting a game of "Stat Spread".  Simply guess which Pokémon has this stat spread. First to ' + statspread.scorecap[room] + ' points wins!');
            }
        }
        if (cmd === 'skipss') {
            Bot.say(by, room, 'The correct answer(s) were: ' + formatAnswer(statspread.answer[room]) + '.');
        }
        statspread.on[room] = true;
        var allMons = Object.keys(POKEDEX);
        //get next mon;
        var tarMon = allMons[~~(allMons.length * Math.random())];
        var statSpread = POKEDEX[tarMon].baseStats;
        statspread.answer[room] = findSimilarBST(statSpread);
        Bot.say(by, room, 'Stat Spread: ' + Object.values(statSpread).join('/') + '. Use ' + config.commandcharacter[0] + 'g to submit your answer.');
    },
    guessstatspread: function(arg, by, room) {
        if (!arg || !statspread.on[room]) return false;
        arg = toId(arg);
        var userid = toId(by);
        if (statspread.answer[room].indexOf(arg) !== -1) {
            if (!statspread.score[room][userid]) {
                statspread.score[room][userid] = 0;
            }
            statspread.score[room][userid]++;
                if (statspread.score[room][userid] >= statspread.scorecap[room]) {
                    Bot.say(by, room, by + ' has won the game! Answer(s): __' + formatAnswer(statspread.answer[room]) + '.__');
                    Economy.give(by, Economy.getPayout(statspread.scorecap[room], room), room);
                    delete statspread.on[room];
                    return Bot.say(config.nick, by, 'Rewards: ' + Economy.getPayout(statspread.scorecap[room], room));
                }
            Bot.say(by, room, by + ' has the right answer and now has ' + statspread.score[room][userid] + ' points! Answer(s): __' + formatAnswer(statspread.answer[room]) + '.__');
            var allMons = Object.keys(POKEDEX);
            //get next mon;
            var tarMon = allMons[~~(allMons.length * Math.random())];
            var statSpread = POKEDEX[tarMon].baseStats;
            statspread.answer[room] = findSimilarBST(statSpread);
            Bot.say(by, room, 'Stat Spread: ' + Object.values(statSpread).join('/') + '. Use ' + config.commandcharacter[0] + 'g to submit your answer.');
        }
    },
    statspreadend: function(arg, by, room) {
        if (!Bot.canUse('statspread', room, by) || room.charAt(0) === ',' || !statspread.on[room]) return false;
        Bot.say(by, room, 'The Stat Spread game has been ended. The correct answer(s) were: ' + formatAnswer(statspread.answer[room]) + '.');
        delete statspread.on[room];
    }
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals Economy */
/* globals statspread */
/* globals POKEDEX */
/* globals checkGame */
/* globals MOVEDEX */
