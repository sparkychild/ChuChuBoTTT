var commandAbuse = {};

exports.Plugins = {
    autorank: function(user, room) {
        if (!Parse.settings[config.serverid][toId(config.nick)].autorank) {
            Parse.settings[config.serverid][toId(config.nick)].autorank = {};
        }
        if (!Parse.settings[config.serverid][toId(config.nick)].autorank[room]) return;
        var rank = Parse.settings[config.serverid][toId(config.nick)].autorank[room];
        var ranks = '+$%@&#~'
        if (ranks.indexOf(user.charAt(0)) >= ranks.indexOf(rank)) return;
        switch (rank) {
            case '+':
                return Bot.talk(room, '/roomvoice ' + user);
                break;
            case '%':
                return Bot.talk(room, '/roomdriver ' + user);
                break;
            case '$':
                return Bot.talk(room, '/roomop ' + user);
                break;
            case '@':
                return Bot.talk(room, '/roommod ' + user);
                break;
            case '&':
                return Bot.talk(room, '/roomleader ' + user);
                break;
        }
    },
    autoRes: function(msg, by, room) {
        if (Bot.isBanned(by) || toId(by) === toId(config.nick)) return false;
        var autoRes = fs.readFileSync('data/autores.txt').toString().split('\n');
        for (var i = 0; i < autoRes.length; i++) {
            var spl = autoRes[i].split('||')
            if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room) {
                try {
                    var regex = new RegExp(spl[3], 'i');
                }
                catch (e) {
                    continue;
                }
                if (!regex.test(msg)) {
                    continue;
                }
                (commandAbuse[toId(by)] ? commandAbuse[toId(by)]++ : commandAbuse[toId(by)] = 1);
                setTimeout(function() {
                    commandAbuse[toId(by)]--
                }, 5000)
                if (commandAbuse[toId(by)] >= 4) {
                    Bot.mute(toId(by));
                    cleanBuffer(toId(by));
                    return;
                }
                return Bot.say(by, room, spl.slice(4).join('||').replace(/{by}/g, by), true);
            }
        }
        return false;
    },
    emoteCount: function(stats) {
        var emoteList = ["#freewolf", "feelsbd", "feelsbn", "feelspn", "feelsdd", "feelsgd", "feelsgn", "feelsmd", "feelsnv", "feelsok", "feelspika", "feelspink", "feelsrs", "feelssc", "fukya", "funnylol", "hmmface", "Kappa", "noface", "Obama", "oshet", "PJSalt", "trumpW", "Sanic", "wtfman", "xaa", "yayface", "yesface", "meGusta", "trollface", "Doge"];
        var emoteData = fs.readFileSync('data/emotecounter.txt').toString().split('\n');
        if (emoteData.length !== emoteList.length * 2) {
            emoteData = [];
            for (var l = 0; l < emoteList.length; l++) {
                emoteData.push(emoteList[l]);
                emoteData.push(0);
            }
        }
        for (var i = 0; i < emoteList.length; i++) {
            if (!stats[emoteList[i]]) {
                continue;
            }
            emoteData[emoteData.indexOf(emoteList[i]) + 1] = emoteData[emoteData.indexOf(emoteList[i]) + 1] * 1 + stats[emoteList[i]];
        }
        fs.writeFileSync('data/emotecounter.txt', emoteData.join('\n'));
    },
    loadQuotes: function(room) {
        var quoteList = fs.readFileSync('data/quotes.txt').toString().split('\n');
        var text = [];
        var hasQuote = false;
        for (var i = 0; i < quoteList.length; i++) {
            var spl = quoteList[i].split('|')
            var tarRoom = spl[0];
            spl = spl.slice(1).join('|');
            if (room === tarRoom) {
                text[text.length] = spl;
                hasQuote = true;
            }
        }
        if (!hasQuote) return '';
        return text;
    },
    loadEntries: function(room) {
        var quoteList = fs.readFileSync('data/entries.txt').toString().split('\n');
        var text = [];
        var hasQuote = false;
        for (var i = 0; i < quoteList.length; i++) {
            var spl = quoteList[i].split('|')
            var tarRoom = spl[0];
            spl = spl.slice(1).join('|');
            if (room === tarRoom) {
                text[text.length] = spl;
                hasQuote = true;
            }
        }
        if (!hasQuote) return '';
        return text;
    },
    mailUser: function(user, room) {
        var mailingList = fs.readFileSync('data/mail.txt').toString().split("\n");
        var updateList = fs.readFileSync('data/mail.txt').toString()
        var changes = false;
        for (var i = 0; i < mailingList.length; i++) {
            var spl = mailingList[i].split('|');
            if (spl[0] === toId(user)) {
                spl = spl.slice(1).join('|');
                Bot.talk(room, (room.charAt(0) === ',' ? '' : '/pm ' + user + ', ') + spl);
                var search = toId(user) + '|' + spl + '\n';
                var idx = updateList.indexOf(search);
                if (idx >= 0) {
                    updateList = updateList.substr(0, idx) + updateList.substr(idx + search.length);
                }
                changes = true;
            }
        }
        if (changes) {
            /*
		 	 var uploadMail = '';
			 for(var indx = 0;indx < updateList.length; indx++){
			 	if(!updateList[indx]){
			 		continue;
			 	}
			 	uploadMail = updateList[idx] + '\n';
			 }*/
            fs.writeFileSync('data/mail.txt', updateList);
            return false;
        }
    },
    checkMail: function(user, room) {
        var mailingList = fs.readFileSync('data/mail.txt').toString().split("\n");
        var changes = false;
        for (var i = 0; i < mailingList.length; i++) {
            var spl = mailingList[i].split('|');
            if (spl[0] === toId(user)) {
                changes = true;
            }
        }
        return changes;
    },

    customCommands: function(msg, by, room) {
        var ranksFrom = ' +★$%@&#~';
        var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
        var parseMsg = msg.split(' ');
        var commandUsed = toId(parseMsg[0].slice(1));
        var arg = parseMsg.slice(1).join(' ').replace(/, /g, ',').split(',');

        for (var idx = 0; idx < ccommands.length; idx++) {
            var spl = ccommands[idx].split('|');
            if (room === spl[2] && commandUsed === spl[3] && config.serverid === spl[0] && toId(config.nick) === spl[1]) {
                //	var rand = (Math.floor(Math.random()

                var returnText = spl.slice(5, spl.length - 1).join('|').replace(/{arg}/g, '{arg[0]}').split('{')

                for (var i = 0; i < returnText.length; i++) {
                    if (!returnText[i].replace(/ /g, '')) {
                        continue;
                    }
                    if (returnText[i].indexOf('}') === -1) {
                        if (i === 0 && spl.slice(5, spl.length - 1).join('|').trim().charAt(0) !== '{') {
                            continue;
                        }
                        returnText[i] = '{' + returnText[i];
                        continue;
                    }
                    var tarRep = returnText[i].split('}')[0];
                    //check if all the neccesary components are here
                    if (tarRep.indexOf(']') !== tarRep.length - 1 || tarRep.indexOf('[') < 1) {
                        if (['arg', 'rand'].indexOf(tarRep.replace(/[^a-z]/g, '')) === 0 || toId(tarRep).substr(0, 6) === 'choose') {
                            returnText[i] = '{' + returnText[i];
                            continue;
                        }
                    }
                    var tarFunction = tarRep.split('}')[0].split('[')[0];
                    //determine value of variable
                    if (tarRep.indexOf(']') === tarRep.length - 1 && tarRep.indexOf('[') > 0 && tarRep.indexOf('[') < tarRep.indexOf(']')) {
                        var value = tarRep.split('[')[1].split(']')[0];
                    }
                    //different things to do to differnet 'functions';
                    switch (tarFunction) {
                        case 'arg':
                            if (!value) {
                                returnText[i] = '{' + returnText[i];
                                continue;
                            }
                            returnText[i] = returnText[i].replace(tarRep + '}', arg[value] || '');
                            break;
                        case 'rand':
                            if (!value) {
                                returnText[i] = '{' + returnText[i];
                                continue;
                            }
                            var rand = ~~(Math.random() * value) + 1;
                            returnText[i] = returnText[i].replace(tarRep + '}', rand);
                            break;
                        case 'choose':
                            if (!value) {
                                returnText[i] = '{' + returnText[i];
                                continue;
                            }
                            value = value.split(',');
                            var rand = ~~(Math.random() * value.length);
                            returnText[i] = returnText[i].replace(tarRep + '}', value[rand].trim());
                            break;
                        case 'pick':
                            if (!arg[0]) {
                                returnText[i] = '';
                                continue;
                            }
                            var rand = ~~(Math.random() * arg.length);
                            returnText[i] = returnText[i].replace(tarRep + '}', arg[rand])
                            break;
                        default:
                            returnText[i] = '{' + returnText[i]
                            break;
                    }
                }
                returnText = returnText.join('');
                returnText = returnText.replace(/{by}/g, by.slice(1));


                returnText = stripCommands(returnText).replace('//me', '/me').replace('//declare', '/declare').replace('//wall', '/wall').replace('!!data', '!data').replace('!!dt', '!dt').replace('//tour', '/tour').replace('//poll', '/poll').replace('!!showimage', '!showimage').replace('//pdeclare', '/pdeclare').replace('//useteam', '/useteam');

                if (!Bot.hasRank(by, ranksFrom.slice(ranksFrom.indexOf(spl[4].replace('n', ' '))))) {
                    if ((returnText.charAt(0) === '/' || returnText.charAt(0) === '!') && returnText.indexOf('/me') !== 0) {
                        returnText = returnText.split(' ').slice(1).join(' ');
                    }
                    room = ',' + by;
                }
                return Bot.say(by, room, returnText, true);
            }
        }
        return false;
    },
    joinMessages: function(room, by) {
        if (toId(by) === toId(config.nick)) return false;
        var data = fs.readFileSync('data/wcmsg.txt').toString().split('\n');
        var ignore = fs.readFileSync('data/ignorewcmsg.txt').toString().split('\n');
        if (ignore.indexOf(toId(by)) > -1) return false;
        if (data.indexOf(room + '|' + config.serverid) > -1 && data[data.indexOf(room + '|' + config.serverid) + 1].charAt(0) === 'n') {
            return Bot.talk(room, '/w ' + by + ',' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(2).replace(/{by}/g, by));
        }
    },
}