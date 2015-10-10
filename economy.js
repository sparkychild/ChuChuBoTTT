var economy;
if (!fs.existsSync('economy/' + config.serverid + '-' + toId(config.nick) + '.json')) {
    var data = {
        global: {
            cp: {
                currency: 'points',
                factor: 10
            },
            data: {}
        },
        rooms: {},
    }
    fs.writeFileSync('economy/' + config.serverid + '-' + toId(config.nick) + '.json', JSON.stringify(data));
}
try {
    economy = JSON.parse(fs.readFileSync('economy/' + config.serverid + '-' + toId(config.nick) + '.json'));
}
catch (e) {
    error('Failed to load economy');
}
//format economy file

exports.Economy = {
    'economy': economy,
    link: 'economy/' + config.serverid + '-' + toId(config.nick) + '.json',
    give: function(user, amount, room) {
        amount = amount * 1;
        if (isNaN(amount)) return false;
        if (!Array.isArray(user)) {
            user = [user];
        }
        var economyData;
        if (room && this.economy.rooms[room]) {
            economyData = this.economy.rooms[room].data;
        }
        else {
            economyData = this.economy.global.data
        }
        for (var i = 0; i < user.length; i++) {
            var tarUser = toId(user[i])
            if (!economyData[tarUser]) {
                economyData[tarUser] = 0;
            }
            economyData[tarUser] += amount;
        }
        this.write();
    },
    write: function() {
        fs.writeFileSync(this.link, JSON.stringify(this.economy));
    },
    addRoom: function(room) {
        if (this.economy.rooms[room]) return false;
        this.economy.rooms[room] = {
            cp: {
                currency: 'points',
                factor: 10
            },
            data: {}
        }
        this.write()
        return true;
    },
    deleteRoom: function(room) {
        if (this.economy.rooms[room]) {
            delete this.economy.rooms[room];
            this.write();
            return true;
        }
        return false;
    },
    clear: function(room, by) {
        if ((!room || !this.economy.rooms[room]) && Parse.rankFrom(by, '~')) {
            this.economy.global.data = {};
        }
        else {
            if (this.economy.rooms[room]) {
                this.economy.rooms[room].data = {}
            }
        }
        this.write()
    },
    getPoints: function(user, room) {
        user = toId(user)
        if (!room || !this.economy.rooms[room]) {
            if (this.economy.global.data[user]) {
                return this.economy.global.data[user];
            }
            else {
                return 0;
            }
        }
        else {
            if (this.economy.rooms[room].data[user]) {
                return this.economy.rooms[room].data[user];
            }
            else {
                return 0;
            }
        }
    },
    getLeaderboard: function(room) {
        if (room && this.economy.rooms[room]) {
            var economyData = JSON.parse(JSON.stringify(this.economy.rooms[room].data));
        }
        else {
            economyData = JSON.parse(JSON.stringify(this.economy.global.data));
        }
        var length = Object.keys(economyData).length;
        var leaderboard = []
        if (length === 0) return [];
        for (var t = 0; t < length; t++) {
            var max = [null, -1];
            for (var i in economyData) {
                if(economyData[i] <= 0) continue;
                if (economyData[i] > max[1]) {
                    max = [i, economyData[i]];
                }
            }
            delete economyData[max[0]];
            var data = {};
            data[max[0]] = max[1];
            leaderboard.push(data);
        }
        return leaderboard;
    },
    getTop: function(room) {
        var data = this.getLeaderboard(room);
        var text = []
        for (var i = 0; i < 5; i++) {
            if (!data[i]) break;
            text.push('#' + (i + 1) + ': ' + Object.keys(data[i])[0] + ' - ``' + data[i][Object.keys(data[i])[0]] + '``');
        }
        return 'Top (' + (this.isRegistered(room) ? room : 'global') + '): ' + text.join(' | ')
    },
    getHastebinLeaderboard: function(room) {
        var data = this.getLeaderboard(room);
        var text = ['***LEADERBOARD***', 'Room : ' + (this.economy.rooms[room] ? room : 'global'), ''];

        function format(place, name, points) {
            place = place.toString()
            points = points.toString();
            var length = points.length + name.length;
            return '#' + place + '    '.slice(place.length) + ': ' + name + '.........................'.slice(length) + points
        }
        for (var i = 0; i < data.length; i++) {
            if (!data[i]) break;
            text.push(format(i + 1, Object.keys(data[i])[0], data[i][Object.keys(data[i])[0]]));
        }
        return text.join('\n');
    },
    currency: function(room) {
        if (!room || !this.economy.rooms[room]) {
            return this.economy.global.cp.currency;
        }
        else {
            return this.economy.rooms[room].cp.currency;
        }
    },
    isRegistered: function(room) {
        if (this.economy.rooms[room]) {
            return true;
        }
        return false;
    },
    getPayout: function(amount, room) {
        if (!room || !this.economy.rooms[room]) {
            return ~~(this.economy.global.cp.factor * amount);
        }
        else {
            return ~~(this.economy.rooms[room].cp.factor * amount);
        }
    }
}