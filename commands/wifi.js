var csv = require('csv-parse');
exports.commands = {
    wifi: function(arg, by, room) {
        if (room.charAt(0) === ',') return false;
        // links to relevant sites for the Wi-Fi room 
        var text = '';
        if (!Bot.canUse('wifi', room, by)) text += '/pm ' + by + ', ';


        arg = arg.split(',');
        var msgType = toId(arg[0]);
        if (!msgType) return Bot.say(by, room, 'Welcome to the Wi-Fi room! Links can be found here: http://pstradingroom.weebly.com/links.html');

        switch (msgType) {
            case 'intro':
                return Bot.say(by, room, text + 'Here is an introduction to Wi-Fi: http://tinyurl.com/welcome2wifi');
            case 'rules':
                return Bot.say(by, room, text + 'The rules for the Wi-Fi room can be found here: http://pstradingroom.weebly.com/rules.html');
            case 'faq':
            case 'faqs':
                return Bot.say(by, room, text + 'Wi-Fi room FAQs: http://pstradingroom.weebly.com/faqs.html');
            case 'scammers':
                return Bot.say(by, room, text + 'List of known scammers: http://tinyurl.com/psscammers');
            case 'cloners':
                return Bot.say(by, room, text + 'List of approved cloners: http://goo.gl/WO8Mf4');
            case 'tips':
                return Bot.say(by, room, text + 'Scamming prevention tips: http://pstradingroom.weebly.com/scamming-prevention-tips.html');
            case 'breeders':
                return Bot.say(by, room, text + 'List of breeders: http://tinyurl.com/WiFIBReedingBrigade');
            case 'signup':
                return Bot.say(by, room, text + 'Breeders Sign Up: http://tinyurl.com/GetBreeding');
            case 'bans':
            case 'banappeals':
                return Bot.say(by, room, text + 'Ban appeals: http://tinyurl.com/WifiBanAppeals');
            case 'lists':
                return Bot.say(by, room, text + 'Major and minor list compilation: http://tinyurl.com/WifiSheets');
            case 'trainers':
                return Bot.say(by, room, text + 'List of EV trainers: http://tinyurl.com/WifiEVtrainingCrew');
            case 'youtube':
                return Bot.say(by, room, text + 'Wi-Fi room\'s official YouTube channel: http://tinyurl.com/wifiyoutube');
            case 'league':
                return Bot.say(by, room, text + 'Wi-Fi Room Pokemon League: http://tinyurl.com/wifiroomleague');
            case 'checkfc':
                if (!config.googleapikey) return Bot.say(by, room, text + 'A Google API key has not been provided and is required for this command to work.');
                if (arg.length < 2) return Bot.say(by, room, text + 'Usage: .wifi checkfc, [fc]');
                this.wifiRoom = this.wifiroom || {
                    docRevs: ['', ''],
                    scammers: {},
                    cloners: []
                };
                var self = this;
                Tools.getDocMeta('0AvygZBLXTtZZdFFfZ3hhVUplZm5MSGljTTJLQmJScEE', function(err, meta) {
                    if (err) return Bot.say(by, room, text + 'An error occured while processing your command.');
                    var value = arg[1].replace(/\D/g, '');
                    if (value.length !== 12) return Bot.say(by, room, text + '"' + arg[1] + '" is not a valid FC.');
                    if (self.wifiRoom.docRevs[1] === meta.version) {
                        value = self.wifiRoom.scammers[value];
                        if (value) return Bot.say(by, room, text + '**The FC ' + arg[1] + ' belongs to a known scammer: ' + (value.length > 61 ? value + '..' : value) + '.**');
                        return Bot.say(by, room, text + 'This FC does not belong to a known scammer.')
                    }
                    self.wifiRoom.docRevs[1] = meta.version;
                    Tools.getDocCsv(meta, function(data) {
                        csv(data, function(err, data) {
                            if (err) return Bot.say(by, room, text + 'An error occured while processing your command.');
                            for (var i = 0, len = data.length; i < len; i++) {
                                var str = data[i][1].replace(/\D/g, '');
                                var strLen = str.length;
                                if (str && strLen > 11) {
                                    for (var j = 0; j < strLen; j += 12) {
                                        self.wifiRoom.scammers[str.substr(j, 12)] = data[i][0];
                                    }
                                }
                            }
                            value = self.wifiRoom.scammers[value];
                            if (value) return Bot.say(by, room, text + '**The FC ' + arg[1] + ' belongs to a known scammer: ' + (value.length > 61 ? value.substr(0, 61) + '..' : value) + '.**');
                            return Bot.say(by, room, 'This FC does not belong to a known scammer.');
                        });
                    });
                });
                break;
            case 'ocloners':
            case 'onlinecloners':
                return false;
                if (!config.googleapikey) return Bot.say(by, room, text + 'A Google API key has not been provided and is required for this command to work.');
                this.wifiRoom = this.wifiroom || {
                    docRevs: ['', ''],
                    scammers: {},
                    cloners: []
                };
                var self = this;
                Tools.getDocMeta('1BcUPm3pp9W2GpLEBgIjgoi-n6wgrEqwDgIZAt82hnGI', function(err, meta) {
                    if (err) {
                        console.log(err);
                        return Bot.say(by, room, text + 'An error occured while processing your command. Please report this!');
                    }
                    text = '/pm ' + by + ', ';
                    if (self.wifiRoom.docRevs[0] == meta.version) {
                        var found = [];
                        for (var i in self.wifiRoom.cloners) {
                            if (self.chatData[toId(self.wifiRoom.cloners[i][0])]) {
                                found.push('Name: ' + self.wifiRoom.cloners[i][0] + ' | FC: ' + self.wifiRoom.cloners[i][1] + ' | IGN: ' + self.wifiRoom.cloners[i][2]);
                            }
                        }
                        if (!found.length) {
                            Bot.say(by, room, text + 'No cloners were found online.');
                            return;
                        }
                        var foundstr = found.join(' ');
                        if (foundstr.length > 266) {
                            self.uploadToHastebin("The following cloners are online :\n\n" + found.join('\n'), function(link) {
                                Bot.say(by, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + link);
                            });
                            return;
                        }
                        Bot.say(by, room, by, "The following cloners are online :\n\n" + foundstr);
                        return;
                    }
                    Bot.say(by, room, text + 'Cloners List changed. Updating...');
                    self.wifiRoom.docRevs[0] = meta.version;
                    Tools.getDocCsv(meta, function(data) {
                        //console.log(data);
                        csv(data, function(err, data) {
                            if (err) {
                                console.log(err);
                                Bot.say(by, room, text + 'An error occured while processing your command. Please report this!');
                                return;
                            }
                            data.forEach(function(ent) {
                                var str = ent[1].replace(/\D/g, '');
                                if (str && str.length >= 12) {
                                    self.wifiRoom.cloners.push([ent[0], ent[1], ent[2]]);
                                }
                            });
                            var found = [];
                            for (var i in self.wifiRoom.cloners) {
                                if (self.chatData[toId(self.wifiRoom.cloners[i][0])]) {
                                    found.push('Name: ' + self.wifiRoom.cloners[i][0] + ' | FC: ' + self.wifiRoom.cloners[i][1] + ' | IGN: ' + self.wifiRoom.cloners[i][2]);
                                }
                            }
                            if (!found.length) {
                                Bot.say(by, room, text + 'No cloners were found online.');
                                return;
                            }
                            var foundstr = found.join(' ');
                            if (foundstr.length > 266) {
                                self.uploadToHastebin("The following cloners are online :\n\n" + found.join('\n'), function(link) {
                                    Bot.say(by, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + link);
                                });
                                return;
                            }
                            Bot.say(by, room, by, "The following cloners are online :\n\n" + foundstr);
                        });
                    });
                });
                break;
            default:
                return Bot.say(by, room, text + 'Unknown option. General links can be found here: http://pstradingroom.weebly.com/links.html');
        }
    },
}