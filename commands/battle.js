exports.commands = {
    evalbattle: function(arg, user, room) {
        if (!Bot.isDev(user)) return false;
        try {
            var result = eval(arg.trim());
            Bot.talk(room, JSON.stringify(result));
        }
        catch (e) {
            Bot.talk(room, e.name + ": " + e.message);
            console.log(e.stack);
        }
    },
    chall: 'challenge',
    challenge: function(arg, by, room) {
        if (!Bot.hasRank(by, '#&~') || !arg) return false;
        arg = arg.split(',');
        if (arg.length !== 2) return false;
        if (toId(arg[0]) === toId(config.nick)) return false;
        var tier = toId(arg[1]);
        if (!TEAMS[toId(arg[1])] && ['battlefactory', 'randombattle', 'challengecup1v1', 'monotyperandombattle', 'hackmonscup'].indexOf(tier) === -1) return false;
        if (TEAMS[tier]) {
            var selectTeam = TEAMS[tier][~~(TEAMS[tier].length * Math.random())];
            send('|/useteam ' + selectTeam);
        }
        send('|/challenge ' + arg[0] + ', ' + toId(arg[1]));
    },
    battlelimit: function(arg, by, room) {
        if (!Bot.rankFrom(by, '~')) return false;
        if (!arg) {
            return Bot.say(by, room, 'The battlecount cap is set at ' + MAXBATTLES);
        }
        if (isNaN(arg * 1)) return false;
        MAXBATTLES = arg * 1;
    },
    battlelist: function(arg, by, room) {
        if (!Bot.rankFrom(by, '~')) return false;
        return Bot.say(by, room, 'List of Current Battles: ' + Object.keys(Battles).join(', '));
    },
    addteam: function(arg, by, room) {
        var Pokedex = isolate(POKEDEX);
        var TypeChart = isolate(TYPECHART);
        //Pawnie|bisharp|airballoon|H|knockoff,hiddenpowerdragon,dualchop,ironhead|Naughty|252,252,,4,,|F|,30,,,,|S|98|156
        //NICKNAME|species|item|ABILITY|moves|NATURE|evs|GENDER|ivs|SHINY|level|happiness[
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
        if (!Bot.rankFrom(by, '~') || !arg) return false;
        var parts = arg.split(',');
        var tier = toId(parts[0]);
        //DONT ALLOW ANYTHING GOES BC OF NO SPECIES CLAUSE;
        var allowedTiers = ['ubers', 'oumomega', 'ou', 'uu', 'ru', 'nu', 'pu', 'monotype', 'lc', 'oumomega', 'battlespotsingles', 'cap', '1v1', 'lcuu'];
        if (allowedTiers.indexOf(tier) == -1) {
            return Bot.say(by, room, 'Sorry, I don\'t accept these teams becaues I cannot play these formats!');
        }
        var link = parts[1].trim();
        if (!link) return Bot.say(by, room, 'The format is ' + config.commandcharacter[0] + ' addteam tier, hastebin of team');
        if (link.indexOf('hastebin.com') === -1) return false;
        var id = link.trim().split('/');
        id = id[id.length - 1];
        var destination = 'http://hastebin.com/raw/' + id;
        var packedTeam = [];
        try {
            Tools.getHastebin(destination, function(data) {
                if (!data) return Bot.say(by, room, 'Error parsing hastebin.');
                Bot.say(by, room, 'Parsing Team....');
                fs.writeFileSync('team.txt', data);
                var PokemonData = data.replace(/\n[\s]+\n/g, '\n\n').split('\n\n');
                for (var i = 0; i < PokemonData.length; i++) {
                    //reset tarpoke
                    if(i >= 6) break;
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
                            tarPoke.species = toId(tarData[0].split('@')[0].split('(')[1].split(')')[0]);
                        }
                    }
                    if (tarData[0].split('@')[0].split('(').length === 3) {
                        tarPoke.gender = tarData[0].split('@')[0].split('(')[2].split(')')[0].toUpperCase();
                    }
                    //for each line thereafter
                    tarPoke.moves = [];
                    for (var l = 1; l < tarData.length; l++) {
                        var tarLine = tarData[l].trim();
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
                                        return Bot.say(by, room, 'Ability not found!');
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
                                order = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
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
                        return Bot.say(by, room, 'One of your Pokemon have no moves!');
                    }
                    //end of JSON team object

                    //create the string for each pokemon... OMG im going to cry now
                    //once again the format is: 
                    //Pawnie|bisharp|airballoon|H|knockoff,hiddenpowerdragon,dualchop,ironhead|Naughty|252,252,,4,,|F|,30,,,,|S|98|156
                    //NICKNAME|species|item|ABILITY|moves|NATURE|evs|GENDER|ivs|SHINY|level|happiness
                    packedTeam[i] = '';
                    packedTeam[i] += tarPoke.nick + '|';
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
                if (TEAMS[tier].indexOf(packedTeam) > -1) return Bot.say(by, room, 'The team is already in the database.');
                TEAMS[tier].push(packedTeam);
                fs.writeFileSync('battle/teams.json', JSON.stringify(TEAMS));
                Bot.say(by, room, 'Done!');
            });
        }
        catch (e) {
            return Bot.say(by, room, 'ERROR in parsing team.');
        }
    },
    tourjoin: function(arg, by, room) {
        if (!Bot.hasRank(by, '@&#~')) return false;
        if (!this.settings[config.serverid][toId(config.nick)].tournaments) {
            this.settings[config.serverid][toId(config.nick)].tournaments = {};
        }
        if (!arg || ['on', 'off'].indexOf(toId(arg)) === -1) return Bot.say(by, room, 'Tour autojoin is ' + (this.settings[config.serverid][toId(config.nick)].tournaments[room] ? 'ON' : 'OFF'));
        switch (toId(arg)) {
            case 'on':
                this.settings[config.serverid][toId(config.nick)].tournaments[room] = true;
                Tools.writeSettings();
                break;
            case 'off':
                if (this.settings[config.serverid][toId(config.nick)].tournaments[room]) {
                    delete this.settings[config.serverid][toId(config.nick)].tournaments[room];
                    Tools.writeSettings();
                }
                break;
        }
        Bot.say(by, room, 'Tour autojoin is ' + (this.settings[config.serverid][toId(config.nick)].tournaments[room] ? 'ON' : 'OFF'));
    },
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals TEAMS */
/* globals toId */
/* globals Bot */
/* globals config */
/* globals Tools */
/* globals TYPECHART */
/* globals fs */
/* globals send */
/* globals isolate */
/* globals POKEDEX */
/* globals MAXBATTLES*/
/* globals Battles */
