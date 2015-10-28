 function postFire(room) {
    ambush.timer[room].fire = setTimeout(function() {
        Bot.say(config.nick, room, (config.serverid === 'showdown' && room === 'lobby' ? 'FIRE' : '**FIRE**'));
        ambush.state[room] = 'fire';
        nextRound(room)
    }, (5000 * Math.random() + 5000));
}

function nextRound(room) {
    ambush.timer[room].nextTurn = setTimeout(function() {
        ambush.state[room] = 'wait';
        ambush.round[room]++;
        for (var i in ambush.data[room]) {
            ambush.data[room][i].moved = false;
            ambush.data[room][i].shield = false;
        }
        Bot.say(config.nick, room, 'Round ' + ambush.round[room] + '. | Players (' + Object.keys(ambush.data[room]).length + '): ' + Object.keys(ambush.data[room]).join(', '));
        postFire(room);
    }, 4500);
}

function clearTimer(room) {
    clearTimeout(ambush.timer[room].fire);
    clearTimeout(ambush.timer[room].nextTurn)
}

exports.commands = {
    ambush: function(arg, by, room) {
        if (room.charAt(0) === ',' || !arg) return false;
        var action = toId(arg);
        var user = toId(by);
        switch (action) {
            case 'new':
                if (!ambush.state[room]) {
                    ambush.state[room] = 'off';
                }
                if (!Bot.canUse('signups', room, by) || ambush.state[room] !== 'off') return false;
                if (checkGame(room)) return Bot.say(by, room, 'There is already a game going on in this room!');
                Bot.say(by, room, 'Hosting a game of ambush! Do ' + config.commandcharacter[0] + 'join to join the game. The goal is to snipe all the other players and be the last one standing.  You get an automatic shield after you fire.');
                game('ambush', room)
                ambush.data[room] = {};
                ambush.state[room] = 'signups';
                ambush.round[room] = 1;
                ambush.timer[room] = {
                    fire: null,
                    nextTurn: null
                };
                break;
            case 'join':
                if (ambush.data[room][user] || !ambush.state[room] || ambush.state[room] !== 'signups') return false;
                ambush.data[room][user] = {
                    moved: false,
                    shield: false
                }
                Bot.say(by, ',' + by, 'Thank you for joining the game of ambush!');
                break;
            case 'start':
                if (!Bot.canUse('signups', room, by) || !ambush.state[room] || ambush.state[room] !== 'signups') return false;
                if (Object.keys(ambush.data[room]).length < 2) return Bot.say(by, room, 'There aren\'t enough players!');
                ambush.state[room] = 'wait';
                ambush.count[room] = Object.keys(ambush.data[room]).length;
                Bot.say(by, room, 'The game is starting! Use ' + config.commandcharacter[0] + 'fire to target another player after I say "FIRE".')
                Bot.say(by, room, 'Round 1. | Players (' + Object.keys(ambush.data[room]).length + '): ' + Object.keys(ambush.data[room]).join(', '));
                postFire(room);
                break;
            case 'end':
                if (!Bot.canUse('signups', room, by)) return false
                clearTimer(room);
                ambush.state[room] = 'off';
                Bot.say(by, room, 'The game of ambush was forcibly ended.')
                break;
        }
    },
    fire: function(arg, by, room) {
        if (!arg) return;
        var user = toId(by);
        var target = toId(arg);
        if (!ambush.state[room] || ambush.state[room] === 'signups' || ambush.state[room] === 'off') return false;
        if (!ambush.data[room] || !ambush.data[room][user]) return false;
        if (ambush.data[room][user].moved) return false;
        ambush.data[room][user].moved = true;
        if (ambush.state[room] !== 'fire') return false;
        ambush.data[room][user].shield = true;
        if (!ambush.data[room][target] || ambush.data[room][target].shield) return false;
        delete ambush.data[room][target];
        if (Object.keys(ambush.data[room]).length < 2) {
            var players = Object.keys(ambush.data[room]);
            var payout = Economy.getPayout(ambush.count[room], room);
            Bot.say(config.nick, room, 'The winner is ..... ' + players.join(', ') + '! Rewards: ' + payout + ' ' + Economy.currency(room));
            Economy.give(players, payout, room);
            clearTimer(room);
            ambush.state[room] = 'off';
        }
    }
}

/* globals ambush */