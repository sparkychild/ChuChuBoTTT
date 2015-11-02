function timeBomb(room) {
    var targetPlayer = Object.keys(bomb.data[room])[~~(Math.random() * Object.keys(bomb.data[room]).length)];
    bomb.hold[room] = targetPlayer;
    bomb.state[room] = 'pass'
    Bot.say(config.nick, room, targetPlayer + ' is handed the bomb! Use ' + config.commandcharacter[0] + 'pass [name] to give the bomb to another player!');
    var rand = 18000 + Math.random() * 8000;
    bomb.timer[room].boom = setTimeout(function() {
        Bot.say(config.nick, room, 'BOOM! ' + bomb.hold[room] + ' is eliminated!');
        delete bomb.data[room][bomb.hold[room]];
        if (Object.keys(bomb.data[room]).length <= 1) {
            var payout = Economy.getPayout(bomb.count[room], room);
            Economy.give(Object.keys(bomb.data[room]), Object.keys(bomb.data[room])[0], room);
            Bot.say(config.nick, room, 'Congrats to ' + Object.keys(bomb.data[room])[0] + ' for winning the game! Rewards: ' + payout + ' ' + Economy.currency(room));
            endBomb(room);
            return;
        }
        summarize(room);
    }, rand);
}

function summarize(room) {
    bomb.state[room] = 'wait';
    Bot.say(config.nick, room, 'Players (' + Object.keys(bomb.data[room]).length + '): ' + Object.keys(bomb.data[room]).join(', '));
    bomb.timer[room].wait = setTimeout(function() {
        timeBomb(room);
    }, 3000 + Math.random() * 3000)
}

function endBomb(room) {
    clearTimeout(bomb.timer[room].boom);
    clearTimeout(bomb.timer[room].wait);
    delete bomb.state[room];
}

exports.commands = {
    passthebomb: function(arg, by, room) {
        if (!arg || room.charAt(0) === ',') return false;
        var action = toId(arg);
        var user = toId(by);
        switch (action) {
            case 'new':
                if (!bomb.state[room]) {
                    bomb.state[room] = 'off'
                }
                if (!Bot.canUse('signups', room, by) || bomb.state[room] !== 'off') return false;
                if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
                bomb.state[room] = 'signups';
                bomb.data[room] = {};
                bomb.timer[room] = {
                    wait: null,
                    boom: null
                }
                Bot.say(by, room, 'Hosting a game of Pass the Bomb.  Use ' + config.commandcharacter[0] + 'join to join the game!');
                break;
            case 'join':
                if (!bomb.state[room] || bomb.state[room] !== 'signups' || bomb.data[room][user]) return false;
                bomb.data[room][user] = 1;
                Bot.say(by, ',' + by, 'Thank you for joining the game of Pass the Bomb.');
                break;
            case 'start':
                if (!bomb.state[room] || bomb.state[room] !== 'signups' || !Bot.canUse('signups', room, by)) return false;
                if (Object.keys(bomb.data[room]).length < 2) return Bot.say(by, room, 'There are not enough players for this to begin!');
                bomb.state[room] = 'wait';
                bomb.count[room] = Object.keys(bomb.data[room]).length;
                Bot.say(by, room, 'The game of Pass the Bomb is starting!')
                summarize(room);
                break;
            case 'end':
                if (!Bot.canUse('signups', room, by) || !bomb.state[room] || bomb.state[room] === 'off') return false;
                endBomb(room);
                delete bomb.state[room];
                Bot.say(by, room, 'The game of Pass the Bomb was forcibly ended.')
                break;
            case 'players':
                if (!Bot.canUse('signups', room, by) || !bomb.state[room] || bomb.state[room] === 'off') return false;
                Bot.say(config.nick, room, 'Players (' + Object.keys(bomb.data[room]).length + '): ' + Object.keys(bomb.data[room]).join(', '));
                break;
        }
    },
    pass: function(arg, by, room) {
        var user = toId(by);
        if (!bomb.state[room] || bomb.state[room] !== 'pass' || bomb.hold[room] !== user) return false;
        var target = toId(arg);
        if (!bomb.data[room][target]) return false;
        bomb.hold[room] = target;
    }
}

/* globals bomb */