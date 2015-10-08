exports.commands = {
    autores: function(arg, by, room) {
        if (!Bot.canUse('autores', room, by)) return false;
        if (!arg) return Bot.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])');
        var command = toId(arg.split(' ')[0]);
        if (!arg.split(' ')[1] && command !== 'list') return Bot.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])');
        var text = arg.split(' ').slice(1).join(' ');
        var input = text.split('::')[0].toLowerCase().replace(/(\*\*|\_\_|\~\~|\`\`)/g, '');
        if (input.length < 2 && command !== 'list') return Bot.say(by, room, 'Please specify a longer phrase for me to search for.')
        if (!Bot.rankFrom(by, '+') && command === 'regex') {
            command = 'add'
        }
        if (command === 'add') {
            input = input.split('');
            for (var i = 0; i < input.length; i++) {
                if (/[^a-z0-9]/i.test(input[i])) {
                    input[i] = '\\' + input[i];
                }
            }
            input = input.join('');
        }
        if (command === 'regex') {
            var tempInput = input.replace(/(\*|\?)/g, '')
            if (input.length / tempInput.length >= 2) {
                return Bot.say(by, room, 'Please specify more text to search for.')
            }
        }
        var output = text.split('::').slice(1).join('::').replace(/(!mod|!driver|!leader|!op|!voice|!admin|\/mod|\/driver|\/voice|\/leader|\/op|\/admin|!deauth|\/deauth|!promote|\/promote|\/demote|!demote|!ban|!lock|\/ban|\/lock|\/transferbucks|\/givebucks|\/takebucks|\/givebuck|\/givemoney|!givebucks|!givemoney|!givebuck|!takebucks|!takebuck|!takemoney|\/takebuck|\/takemoney|!transfer|\/transfer|\/transferbucks|\/transferbuck|\/transfermoney|!transfer|!transferbucks|!transferbuck|!transfermoney)/g, '/me does stuff to ');
        var autoRes = fs.readFileSync('data/autores.txt').toString().split('\n');
        switch (command) {
            case 'regex':
            case 'add':
                if (!output) return Bot.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])')
                    //check if it triggers
                for (var i = 0; i < autoRes.length; i++) {
                    var spl = autoRes[i].split('||');
                    if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room) {
                        var regex = new RegExp(spl[3], 'i');
                        if (!regex.test(input.replace(/\\/g, ''))) {
                            continue;
                        }
                        var regex = new RegExp(input, 'i');
                        if (!regex.test(spl[3].replace(/\\/g, ''))) {
                            continue;
                        }
                        return Bot.say(by, room, 'There is already an auto response with the searching for a similar combination of characters.')
                    }
                }
                fs.appendFile('data/autores.txt', config.serverid + '||' + toId(config.nick) + '||' + room + '||' + input + '||' + output + '\n');
                return Bot.say(by, room, 'Added the search for /' + input + '/i')
                break;
            case 'delete':
                for (var i = 0; i < autoRes.length; i++) {
                    var spl = autoRes[i].split('||');
                    if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room && input === spl[3]) {
                        autoRes.splice(i, 1);
                        fs.writeFileSync('data/autores.txt', autoRes.join('\n'))
                        return Bot.say(by, room, 'Deleted!')
                    }
                }
                Bot.say(by, room, 'I can\'t seem to find this auto response anywhere....')
                break;
            case 'list':
                var uploadText = ['AutoResponse list for room: ', this.rooms[room].name, '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-', ' '];
                for (var i = 0; i < autoRes.length; i++) {
                    var spl = autoRes[i].split('||');
                    if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room) {
                        uploadText.push('Input: ' + spl[3]);
                        uploadText.push('***Output: ' + spl.slice(4).join('||'));
                        uploadText.push(' ');
                        uploadText.push(' ');
                    }
                }
                Tools.uploadToHastebin(uploadText.join('\n'), function(link) {
                    Bot.say(by, room, 'AutoResponse(s): ' + link);
                }.bind(this));
                break;
        }
    },
    autorank: function(arg, by, room) {
        if (!Bot.hasRank(by, '~#')) return false;
        if (arg === 'off') {
            this.settings[config.serverid][toId(config.nick)].autorank[room] = false;
            Tools.writeSettings();
            Bot.say(by, room, 'Autorank is set at: ' + arg);
        }
        if (arg) {
            arg = arg.slice(0, 1)
        }
        else {
            return false;
        }
        if ('@#&~'.indexOf(Bot.ranks[room]) === -1) return Bot.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
        if ('+%$@&'.indexOf(arg) === -1) return false;
        if ('#&~'.indexOf(Bot.ranks[room]) === -1 && arg !== '+') return Bot.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
        if ('#~'.indexOf(Bot.ranks[room]) === -1 && arg === '&') return Bot.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
        this.settings[config.serverid][toId(config.nick)].autorank[room] = arg;
        Tools.writeSettings();
        Bot.say(by, room, 'Autorank is set at: ' + arg);
    },
    wm: 'welcome',
    joinmsg: 'welcome',
    message: 'welcome',
    welcomemessage: 'welcome',
    welcome: function(arg, by, room) {
        if (!fs.existsSync('data/wcmsg.txt') || !fs.existsSync('data/ignorewcmsg.txt')) {
            return Bot.say(by, room, 'Looks like someone forgot to make the files needed for this command.....')
        }
        arg = arg.replace(/, /g, ',').split(',');
        var data = fs.readFileSync('data/wcmsg.txt').toString().split('\n');
        var ignore = fs.readFileSync('data/ignorewcmsg.txt').toString().split('\n');
        switch (arg[0]) {
            case 'set':
                if (!Bot.hasRank(by, '#&~')) return false;
                if (!arg[1]) return Bot.say(by, room, 'You forgot to include a message.');
                if (data.indexOf(room + '|' + config.serverid) > -1) {
                    data[data.indexOf(room + '|' + config.serverid) + 1] = 'n|' + stripCommands(arg.slice(1).join(', '));
                }
                else {
                    data[data.length] = room + '|' + config.serverid;
                    data[data.length] = 'n|' + stripCommands(arg.slice(1).join(', '));
                }
                Bot.say(by, room, 'The welcome message was set.');
                fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
                this.botlog(room, by + ' has set the welcome message in ' + room + ' to: \"' + stripCommands(arg.slice(1).join(', ')) + '\"');
                break;
            case 'on':
                if (!Bot.hasRank(by, '#&~')) return false;
                if (data.indexOf(room + '|' + config.serverid) > -1) {
                    data[data.indexOf(room + '|' + config.serverid) + 1] = 'n' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(1);
                }
                else {
                    return Bot.say(by, room, 'You need to set a welcome message first')
                }
                Bot.say(by, room, 'The welcome message was enabled.');
                fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
                break;
            case 'off':
                if (!Bot.hasRank(by, '#&~')) return false;
                if (data.indexOf(room + '|' + config.serverid) > -1) {
                    data[data.indexOf(room + '|' + config.serverid) + 1] = 'd' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(1);
                }
                else {
                    return Bot.say(by, room, 'You need to set a welcome message first')
                }
                Bot.say(by, room, 'The welcome message was disabled.');
                fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
                break;
            case 'ignore':
                if (room.charAt(0) !== ',') return false;
                if (ignore.indexOf(toId(by)) > -1) return Bot.say(by, room, 'You are already ignoring welcome messages!~');
                fs.appendFile('data/ignorewcmsg.txt', '\n' + toId(by));
                Bot.say(by, room, 'You are now ignoring welcome messages.')
                break;
            case 'unignore':
                if (room.charAt(0) !== ',') return false;
                if (ignore.indexOf(toId(by)) === -1) return Bot.say(by, room, 'You are already recieving welcome messages!~');
                var ignoredata = fs.readFileSync('data/ignorewcmsg.txt').toString();
                var replacer = '\n' + toId(by)
                fs.writeFileSync('data/ignorewcmsg.txt', ignoredata.replace(new RegExp(replacer, "g"), ''));
                Bot.say(by, room, 'You are now recieving welcome messages.')
                break;
            case 'show':
                if (!Bot.hasRank(by, '#&~')) return false;
                if (data.indexOf(room + '|' + config.serverid) === -1) return false;
                Bot.say(by, room, '\"' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(2) + '\"');
        }
    },
}