//data variables:

const MOVEDEX = require('./moves.js').BattleMovedex;
const POKEDEX = require('./pokedex.js').BattlePokedex;
const TYPECHART = require('./typeEff.js').BattleTypeChart;
var MAXBATTLES = 1;

//send the move
function selectMove(room, text) {
    if (!text || typeof text !== 'string') return false;
    if (!text.split(' ')[1] && text.charAt(0) === '/' && text.substr(0, 6) !== '/leave') return false;
    if (Battles[room] && Battles[room].bot.currentMon.mega && text.indexOf('move ') > -1 && text.indexOf(' mega') === -1) {
        debug('[original] ' + text);
        text += ' mega';
    }
    Battles[room].decision = text;
    send(room + '|' + text);
    debug('[selection|' + room + '] ' + text);
}
//screw javascript for changing my pokemon data
function isolate(data) {
    return JSON.parse(JSON.stringify(data));
}
//need to keep team order
//need to keep list of pokemon still working 

//functions for determing effectiveness
function isStab(move, user) {
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var types = Pokedex[user].types
    return types.indexOf(Movedex[move].type) > -1;
}

function isEffective(move, target) {
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var attackType = Movedex[move].type;
    var types = Pokedex[target].types
    if (types.length === 2) {
        return TypeChart[types[0]].damageTaken[attackType] * TypeChart[types[1]].damageTaken[attackType] >= 2;
    }
    return TypeChart[types[0]].damageTaken[attackType] >= 2;
}

function effectiveFactor(move, target) {
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var attackType = Movedex[move].type;
    var types = Pokedex[target].types
    if (types.length === 2) {
        debug('{effectiveFactor} ' + move + '|' + target + '-->' + TypeChart[types[0]].damageTaken[attackType] * TypeChart[types[1]].damageTaken[attackType])
        return TypeChart[types[0]].damageTaken[attackType] * TypeChart[types[1]].damageTaken[attackType];
    }
    debug('{effectiveFactor} ' + move + '|' + target + '-->' + TypeChart[types[0]].damageTaken[attackType])
    return TypeChart[types[0]].damageTaken[attackType];
}

function isResisted(move, target) {
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var attackType = Movedex[move].type;
    var types = Pokedex[target].types
    if (types.length === 2) {
        return TypeChart[types[0]].damageTaken[attackType] * TypeChart[types[1]].damageTaken[attackType] < 1;
    }
    return TypeChart[types[0]].damageTaken[attackType] < 1;
}

function isImmune(move, target) {
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var attackType = Movedex[move].type;
    var types = Pokedex[target].types;
    var abilities = Pokedex[target].abilities;
    var ability = ''
        //gather special abilities
    for (var id in abilities) {
        if (['Dry Skin', 'Storm Drain', 'Water Absorb', 'Flash Fire', 'Levitate', 'Lightning Rod', 'Volt Absorb', 'Sap Sipper'].indexOf(abilities[id]) > -1) {
            ability = abilities[id];
            if (['Storm Drain', 'Dry Skin', 'Water Absorb'].indexOf(ability) > -1 && attackType === 'Water') {
                return true;
            }
            if (['Lightning Rod', 'Volt Absorb'].indexOf(ability) > -1 && attackType === 'Electric') {
                return true;
            }
            if (ability === 'Flash Fire' && attackType === 'Fire') {
                return true
            }
            if (ability === 'Levitate' && attackType == 'Ground') {
                return true;
            }
            if (ability === 'Sap Sipper' && attackType == 'Grass') {
                return true;
            }
            break;
        }
    }
    //ability affected stuff
    //WONDERGUARD
    if (target === 'shedinja' && ['Dark', 'Fire', 'Flying', 'Ghost', 'Rock'].indexOf(attackType) == -1 && !Movedex[move].status) {
        return true;
    }

    if (types.length === 2) {
        return TypeChart[types[0]].damageTaken[attackType] * TypeChart[types[1]].damageTaken[attackType] === 0;
    }
    return TypeChart[types[0]].damageTaken[attackType] === 0;
}

//function for selecting best move
function bestMove(moves, user, target, room, extras) {
    debug('{bestmove}' + JSON.stringify(moves) + '|' + user + '|' + target)
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var allMoves = Battles[room].bot.currentMon.allMoves;
    //functions used to determine base power
    //select the best move;

    if (moves[0] === 'struggle') {
        if (extras) {
            return 0;
        }
        return 1;
    }
    var bestMove = {};
    for (var num = 0; num < moves.length; num++) {
        var move = moves[num];
        if (move === 'recharge') {
            return 1;
        }
        var score = Movedex[move].basePower;
        //score adjustment for certain moves hehehehe
        if (move === 'acrobatics' && !Battles[room].bot.currentMon.item) {
            score = score * 2;
        }
        if (move === 'knockoff' && !Battles[room].opponent.noitem[target]) {
            score = score * 1.5;
        }
        //minor adjustment for priority moves
        if (score > 0 && Movedex[move].priority >= 1 && Battles[room].bot.currentMon.hp <= 0.4) {
            score = score * 1.3;
        }

        if (isImmune(move, target)) {
            debug('{immunity} ' + target + ' is immune to ' + move);
            score = 0;
        }
        if (isResisted(move, target) && !Movedex[move].status) {
            if (isResisted(move, target)) {
                score = score * effectiveFactor(move, target);
            }
        }
        if (isEffective(move, target)) {
            score = score * effectiveFactor(move, target);
        }
        if (isStab(move, user)) {
            score = score * 1.5
        }
        debug('{lookingthroughmoves} ' + move)
            //determine type changing abilities
        if (['pixilate', 'aerilate', 'refrigerate'].indexOf(Battles[room].bot.currentMon.ability) > -1 && Movedex[move].type === 'Normal') {
            score = score * 1.3 * 1.5;
            switch (Battles[room].bot.currentMon.baseAbility) {
                case 'pixilate':
                    if (isEffective('moonblast', target)) {
                        score = score * effectiveFactor('moonblast', target);
                    }
                    if (isResisted('moonblast', target)) {
                        score = score * effectiveFactor('moonblast', target);
                    }
                    break;
                case 'refrigerate':
                    if (isEffective('icebeam', target)) {
                        score = score * effectiveFactor('icebeam', target);
                    }
                    if (isResisted('icebeam', target)) {
                        score = score * effectiveFactor('icebeam', target);
                    }
                    break;
                case 'aerilate':
                    if (isEffective('airslash', target)) {
                        score = score * effectiveFactor('airslash', target);
                    }
                    if (isResisted('airslash', target)) {
                        score = score * effectiveFactor('airslash', target);
                    }
                    break;
            }
        }

        if ((move === 'voltswitch' && !isImmune('voltswitch', target)) || (move === 'uturn' && !isImmune('uturn', target))) {
            score += 25;
        }
        //check rest talk
        //sleep talk first bc no need to spam rest >:(
        if (move === 'sleeptalk' && Battles[room].bot.status[user] !== 'slp') {
            score = 0;
        }
        else if (move === 'sleeptalk' && Battles[room].bot.status[user] === 'slp') {
            return allMoves.indexOf('sleeptalk') + 1;
        }
        if (move === 'rest' && Battles[room].bot.currentMon.hp === 1) {
            score = 0;
        }
        else if (move === 'rest' && Battles[room].bot.currentMon.hp < 0.4) {
            return allMoves.indexOf('rest') + 1;
        }


        //check for special status
        if (['stunspore', 'spore', 'poisonpowder', 'sleeppowder'].indexOf(move) > -1 && Pokedex[target].types.indexOf('Grass') > -1) {
            score = 0;
        }
        //electric types now
        if (Movedex[move].status && Movedex[move].status === 'par' && Pokedex[target].types.indexOf('Electric') > -1) {
            score = 0;
        }

        //knock off BP check - im going to ignore this kek
        //ASSIGN POINTS FOR STATUS
        if (Movedex[move].status === 'brn' && (Pokedex[target].baseStats.atk >= 90 || Pokedex[target].baseStats.atk >= Pokedex[target].baseStats.hp)) {
            if (Pokedex[target].types.indexOf('Fire') === -1) {
                score = 130
            }
            else {
                score = 0;
            }
        }
        //sleep clause
        if (Movedex[move].status === 'slp') {
            if (Object.values(Battles[room].opponent.status).indexOf('slp') > -1) {
                score = 0;
            }
            else {
                score = 160;
            }
        }
        if (Movedex[move].status === 'par' && Pokedex[target].baseStats.spe >= 80) {
            if (Pokedex[target].types.indexOf('Electric') === -1) {
                score = 130;
            }
            else {
                score = 0;
            }
        }
        if(move === 'healbell' || move === 'aromatherapy' && Object.keys(Battles[room].bot.status).length > 0){
            score = (Object.keys(Battles[room].bot.status).length * 50) + 100;
        }
        //check for hazards
        if (move === 'stealthrock') {
            if (Battles[room].bot.hazards.stealthrock === 1) {
                score = 0;
            }
            else {
                score = 125;
            }
        }
        if (move === 'spikes') {
            if (Battles[room].bot.hazards.spikes == 3) {
                score = 0;
            }
            else {
                score = 90;
            }
        }
        if (move === 'toxicspikes') {
            if (Battles[room].bot.hazards.toxicspikes == 2) {
                score = 0;
            }
            else {
                score = 80;
            }
        }
        if (move === 'stickyweb') {
            if (Battles[room].bot.hazards.stickyweb === 1) {
                score = 0;
            }
            else {
                //always use sticky web
                return allMoves.indexOf('stickyweb') + 1;
            }
        }
        if (move === 'taunt') {
            if (Battles[room].opponent.currentMon.taunt) {
                score = 0;
            }
            else {
                score = 130;
            }
        }
        //healing moves
        if (Movedex[move].heal && Movedex[move].basePower === 0) {
            if (Battles[room].bot.currentMon.hp <= 0.4) {
                score = 100 + (100 - Battles[room].bot.currentMon.hp * 100);
            }
            else {
                score = 0;
            }
        }
        //boosting moves
        if (Movedex[move].boosts) {
            score = (Battles[room].bot.currentMon.hp * 100) + 30;
        }
        //wish
        if (move === 'wish' && !Battles[room].bot.wish) {
            if (Battles[room].bot.currentMon.hp <= 0.5) {
                score = 120 + (100 - Battles[room].bot.currentMon.hp * 100);
            }
            else {
                score = 0;
            }
        }
        //protect
        if (move === 'protect' && Battles[room].bot.wish) {
            score = 1000;
        }
        //check for status moves
        if (Movedex[move].status && Movedex[move].basePower === 0 && Battles[room].opponent.status[target]) {
            score = 0;
        }
        //check for magic bounce...
        var MBcheck = false;
        for (var id in Pokedex[target].abilities) {
            if (Pokedex[target].abilities.id === 'Magic Bounce') {
                MBcheck = true;
                break;
            }
        }
        if (MBcheck && Movedex[move].category === 'Status' && Movedex[move].target !== 'self') {
            score = 0;
        }

        //ALWAYS IMPORTANT OFC
        bestMove[move] = score;
    }
    debug('{bestMoveData}' + JSON.stringify(bestMove));
    var top = ['', 0];
    for (var key in bestMove) {
        if (top[1] === 0) {
            top = [key, bestMove[key]];
        }
        if (top[1] < bestMove[key]) {
            top = [key, bestMove[key]];
        }
    }
    if (extras) {
        debug('{evalbestmovescore}' + top[1]);
        return top[1];
    }
    debug('{mymovechoice} ' + top[0]);
    return allMoves.indexOf(top[0]) + 1;
}

function bestMatchUp(myTeam, targetTeam, room) {
    debug('{bestmatchup}' + JSON.stringify(myTeam) + '|' + JSON.stringify(targetTeam));
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    //safetycatch for random battles/opponent has no known 'team'
    if (targetTeam.length === 0) {
        return Battles[room].bot.teamlist.indexOf(myTeam[0]) + 1;
    }

    //details:
    //myTeam refers to what isn't Ko'd yet
    //targetTeam refers to what isn't ko'd yet
    //room is the battle.id
    //discover the target team's weakness;
    //gather types in opponent's team
    var tTypes = [];
    for (var i = 0; i < targetTeam.length; i++) {
        tTypes.push(Pokedex[targetTeam[i]].types[0]);
        if (Pokedex[targetTeam[i]].types[1]) {
            tTypes.push(Pokedex[targetTeam[i]].types[1]);
        }
    }
    //calculate total weakness
    var tWeak = TypeChart[tTypes[0]].damageTaken;
    //console.log(JSON.stringify(tWeak));
    for (var i = 1; i < tTypes.length; i++) {
        for (var type in tWeak) {
            tWeak[type] = tWeak[type] * TypeChart[tTypes[i]].damageTaken[type];
        }
    }
    //determine who does best;
    var best = ['', 0];
    for (var i = 0; i < myTeam.length; i++) {
        var type1 = Pokedex[myTeam[i]].types[0];
        var type2 = Pokedex[myTeam[i]].types[1] || type1;
        var total = tWeak[type1] + tWeak[type2];
        if (total > best[1]) {
            best = [myTeam[i], total];
        }
    }
    return Battles[room].bot.teamlist.indexOf(best[0]) + 1;
}

//return type weakness
function weakness(defender, attacker) {
    debug('{weakness} ' + defender + '|' + attacker);
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    var atkType = Pokedex[attacker].types;
    var defType = Pokedex[defender].types;
    //calculate eff against def
    //omg clearing this shit first
    var eff = null;
    var eff = TypeChart[defType[0]].damageTaken;
    //console.log(JSON.stringify(eff));
    if (defType[1]) {
        for (var type in eff) {
            eff[type] = eff[type] * TypeChart[defType[1]].damageTaken[type]
        }
    }
    //console.log(JSON.stringify(defType) + ' ' + JSON.stringify(eff));
    //return effectiveness
    var total = eff[atkType[0]] * eff[atkType[1]];
    var eff1 = eff[atkType[0]];
    var eff2 = eff[atkType[1]] || 0;
    if (total >= eff1 && total >= eff2) {
        return total;
    }
    else if (eff1 >= eff2) {
        return eff1;
    }
    else {
        return eff2;
    }
    /*
    if (atkType[1]) {
        return eff[atkType[0]] * eff[atkType[1]] || (eff[atkType[0]] >= 1 ? eff[atkType[0]] : 0) || (eff[atkType[1]] >= 1 ? eff[atkType[1]] : 0);
    }
    return eff[atkType[0]];
    */
}


function bestSwitchIn(myTeam, target, room, faint) {
    if (myTeam.length === 1) {
        if (faint) {
            selectMove(room, '/choose switch ' + (Battles[room].bot.teamlist.indexOf(Battles[room].bot.team[0]) + 1));
            return '';
        }
        else {
            var useMove = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room)
            selectMove(room, '/choose move ' + (useMove === 'switch' ? ~~(Math.random() * 4) + 1 : useMove));
            return '';
        }
    }
    debug('{bestswitchin}' + JSON.stringify(myTeam) + ' | ' + target)
        //myteam is Battles.....team - NOT TEAMLIST
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);

    var best = {
        score: 0,
        Mon: []
    };
    //round 1 of choosing -- defensive typing
    for (var i = 0; i < myTeam.length; i++) {
        if (myTeam[i] === Battles[room].bot.currentMon.species) {
            debug('{skipped} ' + myTeam[i])
            continue;
        }
        var score = 1 / (weakness(myTeam[i], target) || 8);
        if (score > best.score) {
            best.Mon = [myTeam[i]];
            best.score = score;
        }
        else if (score === best.score) {
            best.Mon.push(myTeam[i]);
        }
    }
    if (best.Mon.length === 0) {
        return 'move';
    }
    //round 2 - tiebreaker - offensive presence
    if (best.Mon.length > 1) {
        var tarMons = best.Mon
        var best2 = {
            score: 0,
            Mon: []
        };
        for (var i = 0; i < tarMons.length; i++) {
            var score = weakness(target, tarMons[i]);
            if (score > best2.score) {
                best2.Mon = [tarMons[i]];
                best2.score = score;
            }
            else if (score === best2.score) {
                best2.Mon.push(tarMons[i]);
            }
        }
        best = best2;
    }
    var id = Battles[room].bot.teamlist.indexOf(best.Mon[~~(best.Mon.length * Math.random())]) + 1;
    debug('{bestswitch} ' + JSON.stringify(best.Mon));
    return id;
}
//final AI decision hahahaha
function choose(room) {
    //need to not switch for last mon

    //need to deal with choice scarfers
    debug('{choose}')
    var Pokedex = isolate(POKEDEX);
    var Movedex = isolate(MOVEDEX);
    var TypeChart = isolate(TYPECHART);
    //if weak and cant hit SE;
    //add feature to check mega
    if (Pokedex[Battles[room].opponent.currentMon.species + 'mega']) {
        //identify weakness
        var megaWeakness = weakness(Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species + 'mega') > 1
    }
    else {
        megaWeakness = false;
    }
    
    var canSwitch = false;
    if (Battles[room].bot.team.length > 1) {
        var possibleSwitch = tarSwitchIn(Battles[room].bot.currentMon.species, Battles[room].bot.team, Battles[room].opponent.currentMon.species);
        canSwitch = true;
    }
    if(possibleSwitch && weakness(possibleSwitch, Battles[room].opponent.currentMon.species) > 1){
        canSwitch = false;
    }
    
    if (canSwitch && ((weakness(Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species) > 1 || megaWeakness) && bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room, true) < 160 && Movedex[Battles[room].bot.currentMon.allMoves[bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room) - 1]].basePower !== 0) /* Add an extra check for whether or not it wants it's best switch anyways */ || (bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room, true) < 80 && Battles[room].bot.currentMon.item.substr(0, 6) === 'choice')) {
        //choose to switch
        debug('{choose: unfavourable}')
            //debug if it cant switch// dont need oscilation
        if (Battles[room].bot.team.length === 2) {
            //determine other mon
            var lastMon = (Battles[room].bot.team[0] === Battles[room].bot.currentMon.species ? Battles[room].bot.team[0] : Battles[room].bot.team[1])
            if (weakness(lastMon, Battles[room].opponent.currentMon.species) > 1) {
                //if it's going to oscillate, might as well stay in and start spamming moves;
                var action = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room);
                if (action === 'switch') {
                    var switchIn = bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
                    Battles[room].decision = '/choose switch ' + switchIn;
                    return selectMove(room, Battles[room].decision);
                }
                else {
                    Battles[room].decision = '/choose move ' + action;
                    Battles[room].last = action;
                    return selectMove(room, Battles[room].decision);
                }
            }
        }
        if ((Battles[room].bot.currentMon.moves.indexOf('voltswitch') > -1 || Battles[room].bot.currentMon.moves.indexOf('uturn') > -1) && Pokedex[Battles[room].bot.currentMon.species].baseStats.spe > Pokedex[Battles[room].opponent.currentMon.species].baseStats.spe) {
            if (Battles[room].bot.currentMon.moves.indexOf('voltswitch') > -1) {
                if (isImmune('voltswitch', Battles[room].opponent.currentMon.species)) {
                    //choose to switch
                    debug('voltswitch - opponent not immune')
                    var switchIn = bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
                    Battles[room].decision = '/choose switch ' + switchIn;
                    return selectMove(room, Battles[room].decision);
                }
                else {
                    debug('voltswitch - opponent not immune')

                    return selectMove(room, '/move ' + (Battles[room].bot.currentMon.moves.indexOf('voltswitch') + 1))
                    Battles[room].last = Battles[room].bot.currentMon.moves.indexOf('voltswitch') + 1
                }
            }
            Battles[room].decision = '/choose move ' + (Battles[room].bot.currentMon.moves.indexOf('uturn') + 1);
            Battles[room].last = Battles[room].bot.currentMon.moves.indexOf('uturn') + 1;
            return selectMove(room, Battles[room].decision);
        }
        else {
            //prediction for double switches
            var mathRand = Math.random();
            var toggleID = Battles[room].iq;
            if (mathRand < toggleID && Battles[room].bot.team.length !== 1 && Battles[room].opponent.team.length > 1) {
                var mySwitch = tarSwitchIn(Battles[room].bot.currentMon.species, Battles[room].bot.team, Battles[room].opponent.currentMon.species);
                //find my opponent's switch in to my mon
                var oppSwitch = tarSwitchIn(Battles[room].opponent.currentMon.species, Battles[room].opponent.team, mySwitch);
                //find out if i can hit them super effectively?
                var allMoves = Battles[room].bot.currentMon.allMoves;
                var chosenMove = allMoves[bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, oppSwitch, room) - 1];
                if (isImmune(chosenMove, Battles[room].opponent.currentMon.species) || isResisted(chosenMove, Battles[room].opponent.currentMon.species)) {
                    //attempt a double switch?
                    var doubleSwitch = bestSwitchIn(Battles[room].bot.team, oppSwitch, room);
                    if (doubleSwitch) {
                        return selectMove(room, '/choose switch ' + doubleSwitch);
                    }
                }
                else {
                    return selectMove(room, '/choose move ' + (allMoves.indexOf(chosenMove) + 1))
                }

            }
            var theSwitchIn = bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
            if (theSwitchIn) {
                return selectMove(room, '/switch ' + theSwitchIn)
            }
        }
    }
    else {
        debug('{choose: favourable}')
        if (canSwitch && (weakness(Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species) > 1 || megaWeakness) && Pokedex[Battles[room].bot.currentMon.species].baseStats.spe < Pokedex[Battles[room].opponent.currentMon.species].baseStats.spe) {
            debug('oh no! im too slow')
                //determine if i should stay in - enough bulk?;
            var defender = Battles[room].bot.currentMon.species;
            var attacker = Battles[room].opponent.currentMon.species;
            //if can mega
            if (Battles[room].bot.currentMon.mega) {
                defender += 'mega';
            }
            //use higher attacking stat of the opponent
            var attackStat = (Pokedex[attacker].baseStats.spa > Pokedex[attacker].baseStats.atk ? 'spa' : 'atk');
            var defendStat = (attackStat === 'atk' ? 'def' : 'spd');
            //if i cant tank the move then i switch.
            var tankIndex = Pokedex[attacker].baseStats[attackStat] / Pokedex[defender].baseStats[defendStat];
            debug(tankIndex);
            if (tankIndex > 1.2) {
                debug('and.... im switching!')
                return selectMove(room, '/switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room))
            }
        }
        //is the opponent going to switch?
        if (weakness(Battles[room].opponent.currentMon.species, Battles[room].bot.currentMon.species) > 1 && Battles[room].bot.team.length !== 1 && Battles[room].opponent.team.length > 1) {
            var mathRand = Math.random();
            var toggleID = Battles[room].iq;
            if (mathRand < toggleID) {
                //find my opponent's switch in to my mon
                var oppSwitch = tarSwitchIn(Battles[room].opponent.currentMon.species, Battles[room].opponent.team, Battles[room].bot.currentMon.species);
                //find out if i can hit them super effectively?
                var allMoves = Battles[room].bot.currentMon.allMoves;
                var moveChoice = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, oppSwitch, room);
                //choose best move for that
                var chosenMove = allMoves[moveChoice - 1];
                if (!isImmune(chosenMove, Battles[room].opponent.currentMon.species)) {
                    return selectMove(room, '/choose move ' + moveChoice);
                }
            }
        }
        var action = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room);
        if (action === 'switch') {
            var switchIn = bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
            Battles[room].decision = '/choose switch ' + switchIn;
            return selectMove(room, Battles[room].decision);
        }
        else {
            Battles[room].decision = '/choose move ' + action;
            Battles[room].last = action;
            return selectMove(room, Battles[room].decision);
        }
    }
}

function tarSwitchIn(user, team, target) {
    var best = {
        score: -1,
        Mon: []
    };
    //round 1 of choosing -- defensive typing
    for (var i = 0; i < team.length; i++) {
        if (team[i] === user) {
            debug('{skipped} ' + team[i])
            continue;
        }
        var score = 1 / (weakness(team[i], target) || 8);
        if (score > best.score) {
            best.Mon = [team[i]];
            best.score = score;
        }
        else if (score === best.score) {
            best.Mon.push(team[i]);
        }
    }
    if (!best.Mon[0]) {
        return false;
    }
    //round 2 - tiebreaker - offensive presence
    if (best.Mon.length > 1) {
        var tarMons = best.Mon
        var best2 = {
            score: 0,
            Mon: []
        };
        for (var i = 0; i < tarMons.length; i++) {
            var score = weakness(target, tarMons[i]);
            if (score > best2.score) {
                best2.Mon = [tarMons[i]];
                best2.score = score;
            }
            else if (score === best2.score) {
                best2.Mon.push(tarMons[i]);
            }
        }
        best = best2;
    }
    return best.Mon[~~(best.Mon.length * Math.random())];
}

//battle parser
//where it recieves information from the server
exports.battleParser = {
    receive: function(data, room) {
        if (room.indexOf('battle-') !== 0) return;
        if (!data) return;
        var spl = data.split('|');
        if (!spl[1]) {
            return;
        }
        var action = toId(spl[1]);
        if (action !== 'request' && !Battles[room]) {
            return;
        }
        var info = spl.slice(2);
        if (config.debuglevel < 3) {
            console.log('{recieve}  '.green + action)
        }
        switch (action) {
            case 'request':
                //declare a new battle
                if (!Battles[room]) {
                    Battles[room] = {
                        //bot's stuff
                        bot: {
                            //for pokes not ko'd yet
                            team: [],
                            //for keeping order
                            teamlist: [],
                            status: {},
                            hazards: {
                                spikes: 0,
                                toxicspikes: 0,
                                stealthrock: 0,
                                stickyweb: 0,
                            },
                            currentMon: {
                                species: '',
                                moves: [],
                                item: '',
                                data: {},
                                mega: false,
                                hp: null,
                                allMoves: [],
                            },
                            last: null,
                            voltTurn: false,
                            wish: false
                        },
                        //opponent's stuff
                        opponent: {
                            //Poke's not ko'd yet
                            team: [],
                            status: {},
                            currentMon: {
                                species: '',
                                taunt: false,
                                torment: false
                            },
                            noitem: {}
                        },
                        nicknames: {},
                        id: '',
                        faints: 0,
                        decision: '',
                        tier: room.split('-')[1],
                        iq: 0
                    }
                }
                //request|JSON|
                //Gives a JSON object containing a request for a decision (to move or switch). 
                //To assist in your decision, REQUEST.active has information about your active Pokémon,
                //and REQUEST.side has information about your your team as a whole.
                var req = JSON.parse(info.join('|'));
                if (req.active) {
                    var tarMoves = req.active[0].moves;
                    Battles[room].bot.currentMon.species = toId(req.side.pokemon[0].details.split(',')[0])
                    Battles[room].bot.currentMon.moves = [];
                    Battles[room].bot.currentMon.allMoves = [];
                    Battles[room].bot.currentMon.data = tarMoves;
                    Battles[room].bot.currentMon.item = req.side.pokemon[0].item;
                    Battles[room].bot.currentMon.ability = req.side.pokemon[0].baseAbility;
                    Battles[room].bot.currentMon.mega = req.side.pokemon[0].canMegaEvo;
                    Battles[room].bot.currentMon.hp = req.side.pokemon[0].condition.split(' ')[0].split('/')[0] / req.side.pokemon[0].condition.split(' ')[0].split('/')[1];
                    //declare moves i guess....
                    //for cc1v1
                    if (Battles[room].tier.indexOf('1v1') > -1) {
                        Battles[room].bot.team = [Battles[room].bot.currentMon.species];
                    }
                    for (var i in tarMoves) {
                        if (!tarMoves[i]) {
                            continue;
                        }
                        if (!tarMoves[i].disabled) {
                            Battles[room].bot.currentMon.moves.push(toId(tarMoves[i].move));
                        }
                        Battles[room].bot.currentMon.allMoves.push(toId(tarMoves[i].move));
                    }
                    debug('[moves]' + JSON.stringify(Battles[room].bot.currentMon.moves))
                }
                Battles[room].id = req.side.id
                    //team order
                Battles[room].bot.teamlist = [];
                Battles[room].bot.team = [];
                for (var p = 0; p < req.side.pokemon.length; p++) {
                    if (!req.side.pokemon[p]) {
                        continue;
                    }
                    Battles[room].bot.teamlist.push(toId(req.side.pokemon[p].details.split(',')[0]))
                    if (req.side.pokemon[p].condition !== '0 fnt') {
                        Battles[room].bot.team.push(toId(req.side.pokemon[p].details.split(',')[0]))
                    }
                }
                debug('[teamlist]' + JSON.stringify(Battles[room].bot.teamlist))
                debug('[team]' + JSON.stringify(Battles[room].bot.team))
                break;
            case 'turn':
                //ai -
                //reset faint counter
                if (toId(info[0]) === '1') {
                    send(room + '|gl hf!')
                    send(room + '|/timer on')
                }
                Battles[room].faints = 0;
                choose(room);
                break;
            case 'drag':
            case 'switch':
                //|switch|p2a: Porygon|Porygon, L5|
                //|switch|nickname|id, number|
                var player = info[0].substr(0, 2);
                var tarMon = toId(info[1].split(',')[0]);
                Battles[room].nicknames[info[0]] = tarMon;
                if (player !== Battles[room].id) {
                    Battles[room].opponent.currentMon = {
                        species: tarMon,
                        taunt: false,
                        torment: false,
                    }
                    if (Battles[room].opponent.team.indexOf(tarMon) === -1 && ['cc1v1', 'randombattle'].indexOf(Battles[room].tier) > -1) {
                        debug('{newmon}' + tarMon);
                        Battles[room].opponent.team.push(tarMon);
                    }
                    Battles[room].iq += (1 - Battles[room].iq) / 10;

                }
                else {
                    Battles[room].bot.last = null;
                    /*
                    if (tarMon.indexOf('primal') > -1) {
                        var oldName = tarMon.replace('primal', '');
                        debug('{primalreversion} ' + oldName + '-->' + tarMon)
                        Battles[room].bot.team[Battles[room].bot.team.indexOf(oldName)] = tarMon;
                    }
                    */
                    Battles[room].iq = Battles[room].iq / 1.2;
                }
                if (Battles[room].voltTurn && player !== Battles[room].id) {
                    if (Battles[room].bot.team.length === 1) {
                        selectMove(room, '/switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room, true));
                    }
                    else {
                        selectMove(room, '/switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room));
                    }
                    Battles[room].voltTurn = false;
                }
                break;
            case 'poke':
                //|poke|p1|Chinchou
                //|poke|player|Pokemon
                var player = info[0];
                var tarPoke = toId(info[1].split(',')[0]);
                if (player === Battles[room].id) return;
                Battles[room].opponent.team.push(tarPoke);
                break;
            case 'faint':
                //|faint|POKEMON
                var player = info[0].substr(0, 2);
                var tarMon = Battles[room].nicknames[info[0]];
                //remove from team's standing mons
                if (player !== Battles[room].id) {
                    Battles[room].opponent.team.splice(Battles[room].opponent.team.indexOf(tarMon), 1);
                    Battles[room].iq = Battles[room].iq / 1.25;
                }
                else {
                    Battles[room].iq += (1 - Battles[room].iq) / 5;
                    delete Battles[room].bot.status[tarMon];
                }
                Battles[room].faints++
                debug(JSON.stringify(Battles[room].opponent.team));
                debug(JSON.stringify(Battles[room].bot.team));
                //wait to get all faint messages

                if (player === Battles[room].id) {
                    debug('{faints - action}')
                        //wait for all the messages before beginning - 100 ms should be enough;
                    setTimeout(function() {
                        //choose next thing
                        //safety catch for fainting for last mon standing before the |win| message
                        if (!Battles[room]) {
                            return;
                        }
                        if (Battles[room].faints === 2) {
                            //select best matchup
                            selectMove(room, '/switch ' + bestMatchUp(Battles[room].bot.team, Battles[room].opponent.team, room));
                        }
                        else {
                            //select other best switchin
                            debug('{one faint}')
                            if (Battles[room].voltTurn) {
                                debug('{voltturn switch}');
                                Battles[room].chooseAfter = true;
                            }
                            else {
                                debug('{not voltturn wait}')
                                selectMove(room, '/switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room, true));
                            }
                        }
                    }, 100);
                }
                break;
            case 'win':
                //win
                selectMove(room, 'ggwp');
                selectMove(room, '/leave')
                delete Battles[room];
                break;
                //status inflictions
            case 'status':
                //status |-status|p1a: Trickster|tox
                var player = info[0].substr(0, 2);
                if (player === Battles[room].id) {
                    var target = 'bot'
                }
                else {
                    target = 'opponent'
                }
                var tarPoke = Battles[room].nicknames[info[0]];
                Battles[room][target].status[tarPoke] = info[1];
                break;
            case 'curestatus':
            case '-curestatus':
                //|-curestatus|p1a: Suicune|slp
                var player = info[0].substr(0, 2);
                if (player === Battles[room].id) {
                    var target = 'bot'
                }
                else {
                    target = 'opponent'
                }
                var tarPoke = Battles[room].nicknames[info[0]];
                debug('{curestatus} ' + target + '|' + tarPoke);
                delete Battles[room][target].status[tarPoke];
                break;
            case 'cureteam':
            case '-cureteam':
                //|-cureteam|p2a: Snubbull|[from] move: HealBell
                var player = info[0].substr(0, 2);
                if (player === Battles[room].id) {
                    var target = 'bot'
                }
                else {
                    target = 'opponent'
                }
                Battles[room][target].status = {}
                break;
            case 'move':
                //clear last decision
                Battles[room].decision = '';
                //|move|p2a: Drilbur|Stealth Rock|p1a: Trickster
                //hazards
                var tarMove = toId(info[1]);
                var player = info[0].substr(0, 2);
                debug('{recievemove} ' + player + '|' + tarMove);
                if (['stealthrock', 'stickyweb', 'spikes', 'toxicspikes'].indexOf(tarMove) !== -1 && player === Battles[room].id) {
                    Battles[room].bot.hazards[tarMove]++
                }
                //clearing them
                if (tarMove === 'defog') {
                    Battles[room].bot.hazards = {
                        spikes: 0,
                        toxicspikes: 0,
                        stealthrock: 0,
                        stickyweb: 0,
                    }
                }
                //rapid spin
                var Pokedex = isolate(POKEDEX);
                if (tarMove === 'rapidspin' && player !== Battles[room].id && Pokedex[Battles[room].bot.currentMon.species].types.indexOf('Ghost') === -1) {
                    Battles[room].bot.hazards = {
                        spikes: 0,
                        toxicspikes: 0,
                        stealthrock: 0,
                        stickyweb: 0,
                    }
                }
                if (Battles[room].id === player) {
                    if (tarMove === 'taunt') {
                        Battles[room].opponent.currentMon.taunt = true;
                    }
                    if (tarMove === 'torment') {
                        Battles[room].opponent.currentMon.torment = true;
                    }
                    if (tarMove === 'wish') {
                        Battles[room].bot.wish = true;
                    }
                }
                //volt switch and uturn callback
                //choose a new mon
                //bestSwitchIn(mon, room);
                if (Battles[room].id === player) {
                    if ((tarMove === 'voltswitch' || tarMove === 'uturn') && Battles[room].bot.team.length > 1) {
                        debug('{vs/uturn}')
                        Battles[room].decision = '/choose switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
                        selectMove(room, Battles[room].decision)
                    }
                    Battles[room].bot.last = Battles[room].bot.currentMon.moves.indexOf(tarMove) + 1;
                }
                else {
                    if (tarMove === 'voltswitch' || tarMove === 'uturn') {
                        debug('{vs/uturn}')
                        Battles[room].voltTurn = true;
                        Battles[room].iq += (1 - Battles[room].iq) / 10;
                    }
                }
                break;
            case 'start':
            case '-start':
                //just for perish song
                //|-start|p2a: Azumarill|perish1
                if (!info[0]) return;
                var player = info[0].substr(0, 2);
                if (player === Battles[room].id && info[1] === 'perish0') {
                    //try to switch;
                    var switchId = bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room);
                    if (switchId === 1) {
                        //choose a move instead - change later?
                        var switchId = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room);
                    }
                }
                break;
            case 'inactive':
                if (info[0]) {
                    info[0] = info[0].split(' (')[0];
                }
                if (['You have 300 seconds to make your decision.', 'You have 150 seconds to make your decision.', 'Battle timer is now ON: inactive players will automatically lose when time\'s up.'].indexOf(info[0]) > -1) {
                    break;
                }
                selectMove(room, Battles[room].decision)
                break;
            case 'callback':
                debug('{callback}' + info.join('|'));
                if (info[0] === 'trapped') {
                    //use a most effective move
                    //choice callback
                    if (Battles[room].bot.currentMon.item.substr(0, 6) === 'Choice') {
                        return selectMove(room, '/choose move ' + Battles[room].bot.last);
                    }
                    var deci = bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room);
                    var move = (deci === 'switch' ? ~~(Battles[room].bot.currentMon.moves.length * Math.random()) + 1 : deci);
                    Battles[room].decision = '/choose move ' + move;
                    Battles[room].last = move;
                    selectMove(room, Battles[room].decision);
                }
                //cant|p2a: DeathxShinigami|item: Choice Scarf|shadowball
                //for choice stuff
                //debug   {callback}cant|p1a: SnoopingGil|Taunt|sleeptalk

                if (info[0] === 'cant') {
                    if (info[2].substr(0, 12) === 'item: Choice') {
                        if (Battles[room].bot.team.length === 1) {
                            return selectMove(room, '/choose move ' + Battles[room].bot.last);
                        }
                        //still really need to fix this to use the move if it can hit hard
                        var lastmove = Battles[room].bot.currentMon.moves[Battles[room].bot.last - 1];
                        if (isImmune(lastmove, Battles[room].opponent.currentMon.species) || isResisted(lastmove, Battles[room].opponent.currentMon.species)) {
                            return selectMove(room, '/choose switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room));
                        }
                        else {
                            return selectMove(room, '/choose move ' + Battles[room].bot.last);
                        }
                    }
                    else if (info[2] === 'Taunt') {
                        //choose a damaging move?
                        //oops forgot to declare movedex
                        var Pokedex = isolate(POKEDEX);
                        var Movedex = isolate(MOVEDEX);
                        var TypeChart = isolate(TYPECHART);
                        var allowedMoves = [];
                        var myMoves = Battles[room].bot.currentMon.moves;
                        for (var i = 0; i < myMoves.length; i++) {
                            if (Movedex[myMoves[i]].category !== 'Status') {
                                allowedMoves.push(myMoves[i]);
                            }
                        }
                        debug('{taunt -allowed}' + JSON.stringify(allowedMoves))
                        var selectedScore = bestMove(allowedMoves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room, true);
                        var selectedMove = bestMove(allowedMoves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room);
                        if (selectedScore < 80) {
                            //return a switch ofc
                            return selectMove(room, '/switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room))
                        }
                        else {
                            return selectMove(room, '/choose move ' + selectedMove)
                        }
                        //|callback|cant|p1a: Groudon||stoneedge
                    }
                    else if (!info[2]) {
                        var tarMove = info[3];
                        //ran out of pp
                        //splice move from list 
                        //resubmit
                        Battles[room].bot.currentMon.moves.splice(Battles[room].bot.currentMon.moves.indexOf(tarMove), 1);
                        if (Battles[room].bot.currentMon.item.substr(0, 6) === 'Choice') {
                            //choose a switch bc you're out of pp......... or this could call struggle ..... brrrrrr.
                            return selectMove(room, '/choose switch ' + bestSwitchIn(Battles[room].bot.team, Battles[room].opponent.currentMon.species, room));
                        }
                        return selectMove(room, '/choose move ' + bestMove(Battles[room].bot.currentMon.moves, Battles[room].bot.currentMon.species, Battles[room].opponent.currentMon.species, room))
                    }
                }

                break;
            case 'teampreview':
                var firstMon = bestMatchUp(Battles[room].bot.team, Battles[room].opponent.team, room);
                selectMove(room, '/choose team ' + firstMon);
                break;
                /*
                case '-mega':
                case 'mega':
                    //|-mega|p2a: Metagross|Metagross|Metagrossite
                    var player = info[0].substr(0, 2);
                    debug(JSON.stringify(info))
                    if (player === Battles[room].id) {
                        var target = 'bot';
                    }
                    else {
                        target = 'opponent'
                    }

                    var tarPoke = Battles[room].nicknames[info[0]];
                    //rename the nicknames
                    Battles[room].nicknames[info[0]] = tarPoke + 'mega';
                    //replace team with this thing
                    Battles[room][target].team[Battles[room][target].team.indexOf(tarPoke)] = tarPoke + 'mega';
                    Battles[room][target].currentMon.species = tarPoke + 'mega';
                    debug('{mega} ' + Battles[room][target].currentMon.species)
                    break;
                    */
            case 'detailschange':
                //|detailschange|p1a: Groudon|Groudon-Primal\\n|
                var player = info[0].substr(0, 2);
                info[1] = info[1].split(',')[0];
                if (player === Battles[room].id) {
                    var target = 'bot';
                }
                else {
                    target = 'opponent';
                }
                if (info[1].indexOf('-Primal') > -1 || info[1].indexOf('-Mega') > -1) {
                    var original = toId(info[1].split('-')[0])
                    debug('{primalreversion/mega}' + target);
                    var targetMon = toId(info[1]);
                    //replace shit;
                    Battles[room].nicknames[info[0]] = targetMon;
                    Battles[room][target].currentMon.species = targetMon;
                    Battles[room][target].team[Battles[room][target].team.indexOf(original)] = targetMon;
                }
                break;
            case 'supereffective':
                //|-supereffective|p1a: Cute Loyal User
                var player = info[0].substr(0, 2);
                if (player !== Battles[room].id) {
                    Battles[room].iq = Battles[room].iq / 1.4;
                }
                else {
                    Battles[room].iq += (1 - Battles[room].iq) / 5;
                }
                break;
            case 'resisted':
                //|-resisted|p1a: Rock-Solid Loyalty
                var player = info[0].substr(0, 2);
                if (player === Battles[room].id) {
                    Battles[room].iq = Battles[room].iq / 1.33;
                }
                else {
                    Battles[room].iq += (1 - Battles[room].iq) / 6;
                }
                break;
            case 'heal':
                //|-heal|p1a: Loyalty is Beauty|304/394|[from] move: Wish|
                if (info[0].substr(0, 2) === Battles[room].id && info[2] === '[from] move: Wish') {
                    Battles[room].bot.wish = false;
                }
                break;
            case 'enditem':
                //|-enditem|p1a: Chinchou|Choice Scarf|[from] move: Knock Off|[of] p2a: Trickster
                var tarMon = Battles[room].nicknames[info[0]];
                if (Battles[room].id !== info[0].substr(0, 2)) {
                    Battles[room].opponent.noitem[tarMon] = true;
                }
                break;
        }
    },
    accept: function(user, tier) {
        if (!user || !tier) return;
        if ((!TEAMS[tier] && ['battlefactory', 'randombattle', 'challengecup1v1', 'monotyperandombattle', 'hackmonscup'].indexOf(tier) === -1) || Object.keys(Battles).length >= MAXBATTLES || Parse.isBanned(user)) {
            return send('|/reject ' + user);
        }
        if (TEAMS[tier]) {
            var selectTeam = TEAMS[tier][~~(TEAMS[tier].length * Math.random())]
            send('|/useteam ' + selectTeam);
        }
        send('|/accept ' + user);
    },
    tournaments: function(message, room) {
        //'a[">viridianforest\\n|tournament|create|ou|Single Elimination|0"]'
        //cmd: /tour acceptchallenge
        var info = message;
        if (!info[0]) return false;
        switch (info[0]) {
            case 'create':
                tier = info[1];
                if (!Parse.settings[config.serverid][toId(config.nick)].tournaments) {
                    Parse.settings[config.serverid][toId(config.nick)].tournaments = {};
                }
                if (!Parse.settings[config.serverid][toId(config.nick)].tournaments[room]) return false;
                if (!TEAMS[tier] && ['battlefactory', 'randombattle', 'challengecup1v1', 'monotyperandombattle', 'hackmonscup'].indexOf(tier) === -1) return false;
                Tours[room] = info[1];
                send((room === 'lobby' ? '' : room) + '|/tour join');
                break;
            case 'update':
                try {
                    var tourData = JSON.parse(info[1]);
                }
                catch (e) {
                    return false;
                }
                if (tourData.challenged) {
                    var tier = Tours[room];
                    if (TEAMS[tier]) {
                        var selectTeam = TEAMS[tier][~~(TEAMS[tier].length * Math.random())]
                        send('|/useteam ' + selectTeam);
                    }
                    send((room === 'lobby' ? '' : room) + '|/tour acceptchallenge');
                }
                else if (tourData.challenges) {
                    var tier = Tours[room];
                    if (!tourData.challenges[0]) return;
                    if (TEAMS[tier]) {
                        var selectTeam = TEAMS[tier][~~(TEAMS[tier].length * Math.random())]
                        send('|/useteam ' + selectTeam);
                    }
                    send((room === 'lobby' ? '' : room) + '|/tour challenge ' + tourData.challenges[0]);
                }
                break;
        }
    }
};
exports.commands = {
    evalbattle: function(arg, user, room) {
        if (!this.isDev(user)) return false;
        try {
            var result = eval(arg.trim());
            this.talk(room, JSON.stringify(result));
        }
        catch (e) {
            this.talk(room, e.name + ": " + e.message);
            console.log(e.stack);
        }
    },
    chall: 'challenge',
    challenge: function(arg, by, room) {
        if (!this.hasRank(by, '#&~') || !arg) return false;
        var arg = arg.split(',');
        if (arg.length !== 2) return false;
        if (toId(arg[0]) === toId(config.nick)) return false;
        var tier = toId(arg[1]);
        if (!TEAMS[toId(arg[1])] && ['battlefactory', 'randombattle', 'challengecup1v1', 'monotyperandombattle', 'hackmonscup'].indexOf(tier) === -1) return false;
        if (TEAMS[tier]) {
            var selectTeam = TEAMS[tier][~~(TEAMS[tier].length * Math.random())]
            send('|/useteam ' + selectTeam);
        }
        send('|/challenge ' + arg[0] + ', ' + toId(arg[1]));
    },
    battlelimit: function(arg, by, room) {
        if (!this.rankFrom(by, '~')) return false;
        if (!arg) {
            return this.say(by, room, 'The battlecount cap is set at ' + MAXBATTLES);
        }
        if (typeof arg !== 'number') return false;
        MAXBATTLES = arg;
    },
    battlelist: function(arg, by, room) {
        if (!this.rankFrom(by, '~')) return false;
        return this.say(by, room, 'List of Current Battles: ' + Object.keys(Battles).join(', '));
    },
    addteam: function(arg, by, room) {
        var Pokedex = isolate(POKEDEX);
        var Movedex = isolate(MOVEDEX);
        var TypeChart = isolate(TYPECHART);
        //Pawnie|bisharp|airballoon|H|knockoff,hiddenpowerdragon,dualchop,ironhead|Naughty|252,252,,4,,|F|,30,,,,|S|98|156
        //NICKNAME|species|item|ABILITY|moves|NATURE|evs|GENDER|ivs|SHINY|level|happiness
        /*
        Pawnie (Bisharp) (F) @ Air Balloon  
        Ability: Pressure  
        Level: 98  
        Shiny: Yes  
        Happiness: 156  
        EVs: 252 HP / 252 Atk / 4 SpA  
        Naughty Nature  
        - Knock Off  
        - Hidden Power [Dragon]  
        - Dual Chop  
        - Iron Head
                
        EVs: 4 HP / 16 Atk / 48 Def / 4 SpA / 156 SpD / 92 Spe  
        */
        if (!this.rankFrom(by, '~') || !arg) return false;
        var parts = arg.split(',');
        var tier = toId(parts[0]);
        //DONT ALLOW ANYTHING GOES BC OF NO SPECIES CLAUSE;
        var allowedTiers = ['ubers', 'oumomega', 'ou', 'uu', 'ru', 'nu', 'pu', 'monotype', 'lc', 'oumomega', 'battlespotsingles', 'cap', '1v1', 'lcuu'];
        if (allowedTiers.indexOf(tier) == -1) {
            return this.say(by, room, 'Sorry, I don\'t accept these teams becaues I cannot play these formats!')
        }
        var link = parts[1].trim();
        if (!link) return this.say(by, room, 'The format is ' + config.commandcharacter[0] + ' addteam tier, hastebin of team')
        if (link.indexOf('hastebin.com') === -1) return false;
        var id = link.trim().split('/');
        id = id[id.length - 1];
        var destination = 'http://hastebin.com/raw/' + id;
        var self = this;
        var packedTeam = [];
        try {
            this.getHastebin(destination, function(data) {
                if (!data) return self.say(by, room, 'Error parsing hastebin.')
                self.say(by, room, 'Parsing Team....')
                var PokemonData = data.split('\n\n');
                for (var i = 0; i < PokemonData.length; i++) {
                    //reset tarpoke
                    var tarPoke = {};
                    //line one the pokemon/nickname/gender/item
                    var tarData = PokemonData[i].split('\n');
                    //determine item
                    var item = tarData[0].split('@')[1];
                    tarPoke.item = (item ? toId(item) : '');
                    //determine nickname
                    tarPoke.nick = tarData[0].split('@')[0].split('(')[0].trim();
                    //determine species and gender
                    if (tarData[0].split('@')[0].indexOf('(') > -1) {
                        if (tarData[0].split('@')[0].split('(')[1].split(')')[0].length === 1) {
                            tarPoke.gender = tarData[0].split('@')[0].split('(')[1].split(')')[0].toUpperCase().trim();
                        }
                        else {
                            tarPoke.species = toId(tarData[0].split('@')[0].split('(')[1].split(')')[0])
                        }
                    }
                    if (tarData[0].split('@')[0].split('(').length === 3) {
                        tarPoke.gender = tarData[0].split('@')[0].split('(')[2].split(')')[0].toUpperCase();
                    }
                    //for each line thereafter
                    tarPoke.moves = [];
                    for (var l = 1; l < tarData.length; l++) {
                        var tarLine = tarData[l];
                        if (!tarLine) continue;
                        if (tarLine.indexOf(': ') > -1) {
                            var dataLine = tarLine.split(': ');
                            switch (dataLine[0]) {
                                case 'Level':
                                    tarPoke.level = toId(dataLine[1]);
                                    break;
                                case 'Shiny':
                                    tarPoke.shiny = true;
                                    break;
                                case 'Happiness':
                                    tarPoke.happiness = toId(dataLine[1]);
                                    break;
                                case 'Ability':
                                    var ability = dataLine[1].trim();
                                    var searchPoke = tarPoke.species || toId(tarPoke.nick);
                                    var possibleAbilities = Pokedex[searchPoke].abilities;
                                    for (var a in possibleAbilities) {
                                        if (possibleAbilities[a] === ability) {
                                            var myAbility = a;
                                        }
                                    }
                                    if (!myAbility && myAbility !== 0) {
                                        return self.say(by, room, 'Ability not found!');
                                    }
                                    else {
                                        tarPoke.ability = myAbility;
                                    }
                                    break;
                                case 'EVs':
                                    var evData = dataLine[1].split(' / ');
                                    tarPoke.evs = ['0', '0', '0', '0', '0', '0'];
                                    var order = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
                                    for (var e = 0; e < evData.length; e++) {
                                        evData[e] = evData[e].trim();
                                        var eValue = evData[e].split(' ')[0];
                                        var eID = evData[e].split(' ')[1];
                                        tarPoke.evs[order.indexOf(eID)] = eValue;
                                    }
                                    break;
                            }
                        }
                        //check MOVES;
                        //validate ivs for Hidden Power
                        if (tarLine.charAt(0) === '-') {
                            tarPoke.moves.push(toId(tarLine));
                            if (toId(tarLine).substr(0, 12) === 'hiddenpower') {
                                var HPtype = toId(tarLine).slice(12);
                                HPtype = HPtype.charAt(0).toUpperCase() + HPtype.slice(1);
                                var order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
                                tarPoke.ivs = ['31', '31', '31', '31', '31', '31'];
                                var neededIVs = TypeChart[HPtype].HPivs;
                                for (var type in neededIVs) {
                                    tarPoke.ivs[order.indexOf(type)] = '30';
                                }
                            }
                        }
                        //I FORGOT NATURE
                        if (tarLine.indexOf(' Nature') > -1) {
                            tarPoke.nature = tarLine.split(' ')[0].trim();
                        }
                    }
                    if (tarPoke.moves.length === 0) {
                        return self.say(by, room, 'One of your Pokemon have no moves!');
                    }
                    //end of JSON team object

                    //create the string for each pokemon... OMG im going to cry now
                    //once again the format is: 
                    //Pawnie|bisharp|airballoon|H|knockoff,hiddenpowerdragon,dualchop,ironhead|Naughty|252,252,,4,,|F|,30,,,,|S|98|156
                    //NICKNAME|species|item|ABILITY|moves|NATURE|evs|GENDER|ivs|SHINY|level|happiness
                    packedTeam[i] = '';
                    packedTeam[i] += tarPoke.nick + '|'
                    packedTeam[i] += (tarPoke.species || '') + '|';
                    packedTeam[i] += (tarPoke.item || '') + '|';
                    packedTeam[i] += (tarPoke.ability || '0') + '|';
                    packedTeam[i] += tarPoke.moves.join(',') + '|';
                    packedTeam[i] += (tarPoke.nature || 'Serious') + '|';
                    packedTeam[i] += (tarPoke.evs ? tarPoke.evs.join(',') : ',,,,,') + '|';
                    packedTeam[i] += (tarPoke.gender || '') + '|';
                    packedTeam[i] += (tarPoke.ivs ? tarPoke.ivs.join(',') : '') + '|';
                    packedTeam[i] += (tarPoke.shiny ? 'S' : '') + '|';
                    packedTeam[i] += (tarPoke.level || '') + '|';
                    packedTeam[i] += tarPoke.happiness || '';
                }
                //end of each poke
                packedTeam = packedTeam.join(']');
                //sync teams first
                TEAMS = JSON.parse(fs.readFileSync('battle/teams.json'));
                if (!TEAMS[tier]) {
                    TEAMS[tier] = [];
                }
                if (TEAMS[tier].indexOf(packedTeam) > -1) return self.say(by, room, 'The team is already in the database.');
                TEAMS[tier].push(packedTeam);
                fs.writeFileSync('battle/teams.json', JSON.stringify(TEAMS));
                self.say(by, room, 'Done!');
            })
        }
        catch (e) {
            return this.say(by, room, 'ERROR in parsing team.')
        }
    },
};