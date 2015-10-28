//global.Tools
var sys = require('sys');
var https = require('https');
var http = require('http');
var url = require('url');
var deck = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var card = {
    'a': '♥A',
    'b': '♥2',
    'c': '♥3',
    'd': '♥4',
    'e': '♥5',
    'f': '♥6',
    'g': '♥7',
    'h': '♥8',
    'i': '♥9',
    'j': '♥10',
    'k': '♥J',
    'l': '♥Q',
    'm': '♥K',
    'n': '♦A',
    'o': '♦2',
    'p': '♦3',
    'q': '♦4',
    'r': '♦5',
    's': '♦6',
    't': '♦7',
    'u': '♦8',
    'v': '♦9',
    'w': '♦10',
    'x': '♦J',
    'y': '♦Q',
    'z': '♦K',
    'A': '♣A',
    'B': '♣2',
    'C': '♣3',
    'D': '♣4',
    'E': '♣5',
    'F': '♣6',
    'G': '♣7',
    'H': '♣8',
    'I': '♣9',
    'J': '♣10',
    'K': '♣J',
    'L': '♣Q',
    'M': '♣K',
    'N': '♠A',
    'O': '♠2',
    'P': '♠3',
    'Q': '♠4',
    'R': '♠5',
    'S': '♠6',
    'T': '♠7',
    'U': '♠8',
    'V': '♠9',
    'W': '♠10',
    'X': '♠J',
    'Y': '♠Q',
    'Z': '♠K',
}

var pointValueBJ = {
    'A': 11,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 10,
    'Q': 10,
    'K': 10
};
//global.Tools
exports.Tools = {
    getTimeAgo: function(time) {
        time = ~~((Date.now() - time) / 1000);

        var seconds = time % 60;
        var times = [];
        if (seconds) times.push(seconds + (seconds === 1 ? ' second' : ' seconds'));
        if (time >= 60) {
            time = ~~((time - seconds) / 60);
            var minutes = time % 60;
            if (minutes) times.unshift(minutes + (minutes === 1 ? ' minute' : ' minutes'));
            if (time >= 60) {
                time = ~~((time - minutes) / 60);
                var hours = time % 24;
                if (hours) times.unshift(hours + (hours === 1 ? ' hour' : ' hours'));
                if (time >= 24) {
                    time = ~~((time - hours) / 24);
                    var days = time % 365;
                    if (days) times.unshift(days + (days === 1 ? ' day' : ' days'));
                    if (time >= 365) {
                        var years = ~~((time - days) / 365);
                        if (days) times.unshift(years + (years === 1 ? ' year' : ' years'));
                    }
                }
            }
        }
        if (!times.length) return '0 seconds';
        return times.join(', ');
    },
    syncSettings: function() {
        //keep data across several bots
        try {
            var mySettings = Parse.settings[config.serverid][toId(config.nick)];
        }
        catch (e) {}
        try {
            Parse.settings = JSON.parse(fs.readFileSync('settings.json'));
        }
        catch (e) {
            return false;
        } // file doesn't exist [yet]
        if (!Parse.settings[config.serverid]) {
            Parse.settings[config.serverid] = {};
        }
        if (!Parse.settings[config.serverid][toId(config.nick)]) {
            Parse.settings[config.serverid][toId(config.nick)] = {};
        }
        Parse.settings[config.serverid][toId(config.nick)] = mySettings;
        //end
        return true;
    },
    writeSettings: function() {
        var overWriteCatch = this.syncSettings();
        if (!overWriteCatch) {
            error('writeSettings: failed')
            return;
        }
        var data = JSON.stringify(Parse.settings);
        fs.writeFileSync('settings.json', data);
    },
    uncacheTree: function(root) {
        var uncache = [require.resolve(root)];
        do {
            var newuncache = [];
            for (var i = 0; i < uncache.length; ++i) {
                if (require.cache[uncache[i]]) {
                    newuncache.push.apply(newuncache,
                        require.cache[uncache[i]].children.map(function(module) {
                            return module.filename;
                        })
                    );
                    delete require.cache[uncache[i]];
                }
            }
            uncache = newuncache;
        } while (uncache.length > 0);
    },
    generateString: function() {
        var letters = 'qwertyuiopasdfghjklzxcvbnm1234567890';
        var length = ~~(Math.random() * 12) + 8;
        var text = ''
        for (var i = 0; i < length; i++) {
            var rand = ~~(letters.length * Math.random())
            text += letters[rand];
        }
        return text;
    },
    translate: function(room, parts, text, from, to) {
        this.translateAPI(text.replace(/[^A-Z\,\.a-z0-9\!\?\s\:\;\(\)\'\"\/']/g, ''), from, to, function(translation) {
            Bot.talk(room, (parts ? parts + ',' : '') + translation);
        }.bind(this));
    },
    translateAPI: function(text, from, to, callback) {
        var returnText = ''
        try {
            var string = this.generateString();
            http.get('http://mymemory.translated.net/api/get?q=' + text + '&langpair=' + from + '|' + to + '&de=' + string + '@gmail.com', function(res) {
                var data = '';
                res.on('data', function(part) {
                    data += part;
                });
                res.on('end', function(end) {
                    try {
                        var json = JSON.parse(data);
                    }
                    catch (e) {}
                    if (!json) {
                        callback(text);
                    }
                    else {
                        callback(json.responseData.translatedText)
                    }
                });
            });
        }
        catch (e) {
            callback(text);
        }
    },
    getHastebin: function(link, callback) {
        if (link.indexOf('http://hastebin.com/raw/') !== 0) return;
        http.get(link, function(res) {
            var data = '';
            res.on('data', function(part) {
                data += part
            });
            res.on('end', function(end) {
                callback(data);
            });
        });
    },
    getDocMeta: function(id, callback) {
        https.get('https://www.googleapis.com/drive/v2/files/' + id + '?key=' + config.googleapikey, function(res) {
            var data = '';
            res.on('data', function(part) {
                data += part;
            });
            res.on('end', function(end) {
                var json = JSON.parse(data);
                if (json) {
                    callback(null, json);
                }
                else {
                    callback('Invalid response', data);
                }
            });
        });
    },
    getDocCsv: function(meta, callback) {
        console.log('getting csv')
        https.get('https://docs.google.com/spreadsheet/pub?key=' + meta.id + '&output=csv', function(res) {
            var data = '';
            res.on('data', function(part) {
                data += part;
            });
            res.on('end', function(end) {
                callback(data);
            });
        });
    },
    uploadToHastebin: function(toUpload, callback) {
        if (typeof callback !== 'function') return false;
        var reqOpts = {
            hostname: 'hastebin.com',
            method: 'POST',
            path: '/documents'
        };

        var req = http.request(reqOpts, function(res) {
            res.on('data', function(chunk) {
                // CloudFlare can go to hell for sending the body in a header request like this
                try {
                    var filename = JSON.parse(chunk).key;
                }
                catch (e) {
                    if (typeof chunk === 'string' && /^[^\<]*\<!DOCTYPE html\>/.test(chunk)) {
                        callback('Cloudflare-related error uploading to Hastebin: ' + e.message);
                    }
                    else {
                        callback('Unknown error uploading to Hastebin: ' + e.message);
                    }
                }
                callback('http://hastebin.com/raw/' + filename);
            });
        });
        req.on('error', function(e) {
            callback('Error uploading to Hastebin: ' + e.message);
            //throw e;
        });
        req.write(toUpload);
        req.end();
    },
    parseHandTotal: function(hand) {
        var aceCount = 0
        var handTotal = 0;

        for (var i = 0; i < hand.length; i++) {
            handTotal = handTotal + pointValueBJ[hand[i].slice(1)]
            if (hand[i].slice(1) === 'A') {
                aceCount++
            }
        }
        if (handTotal > 21) {
            var difference = ~~((handTotal - 22) / 10) + 1;
            if (aceCount >= difference) {
                handTotal = handTotal - 10 * difference;
            }
            else {
                handTotal = handTotal - aceCount * 10;
            }
        }
        return handTotal;
    },
    generateDeck: function(packs) {
        if (!packs || isNaN(packs * 1)) {
            packs = 1;
        }
        else {
            packs = ~~packs
        }
        var tarDeck = ''
        for (var i = 0; i < packs; i++) {
            tarDeck += deck;
        }
        for (var idx = 0; idx < (tarDeck.length + 2) * (tarDeck.length + 2); idx++) {
            var randomInt = Math.floor(Math.random() * 52 + 1);
            tarDeck = tarDeck.slice(1, randomInt) + tarDeck.charAt(0) + tarDeck.slice(randomInt, tarDeck.length);
        }
        var returnDeck = [];
        for (var i = 0; i < tarDeck.length; i++) {
            returnDeck[returnDeck.length] = card[tarDeck[i]];
        }
        return returnDeck;
    },
};
