var rpRoom = 'roleplaying';
var rpModes = [
	'thesims4', 'Modern Citylife Edition: Life Simulated RP where death can happen.',
	'hauntedhouseonhorrorhill', 'House with lots of graves and ghosts, lightning flashes at times.',
	'freeroam', 'In Freeroam, you can be a trainer, Pokemon, Gijinka, or anything Pokemon related. You are also free to do what you wish in terms of plots and setting, however, all global room rules still apply such as no legends.',
	'cruise', 'Freeroam on a ship.Roleplay as a Pokemon, do activities that are often done on cruise ships, and interact with other users  on the cruise ship with you, while the host/captain controls various things such as when the ship stops, what time it is, etc',
	'kingdom', 'Kingdom is a roleplay about living in a kingdom similar to the ones of the Middle Ages, except with Pokemon. Players choose roles of a typical medieval kingdom, such as a king, a queen, and so forth or a roles like rebels, thieves, and so on',
	'prom', 'Based on real life high school proms, in Prom, you live through a high school prom in a typical freeform fashion. A host is usually used to manage relationships, take song requests, and to introduce everyone to the roleplay when it starts.',
	'conquest', 'Conquest is an RP that involves monotype battling - all 18 types are called out and assigned to different people. The object of Conquest is to gain dominion over the other types by battling and defeating the Warlord for each type. Alliances can be made.',
	'pokehigh', 'Within School or University, users can be a Teacher of a class, a Principal who acts as the host, or a student. Teachers, appointed by the host, have 5 minutes to teach their classes.',
	'trainer', 'Trainer simulates the playthrough of the actual Pokemon games. There will be a host who will assign roles - these roles, like the games, include main trainers, gym leaders, the Elite Four and Champion, and evil organization. A progressive RP.',
	'murdermystery', 'Murder Mystery is a Roleplay that contains a host, who, optionally, has a co-host, which assists the host with the managing of the RP in most cases. The players must find out, out of the group of players, who the killers are, before all of the innocents are killed.',
	'pokemonmysterydungeon', 'The PMD roleplay is mostly based off the spin-off series of Pokemon which the RP takes the name of, Pokemon Mystery Dungeon. To completely understand what is going on in the RP, knowing the games itself is vital. http://psroleplaying.wix.com/roleplay#!variants/c23jw',
	'totaldramaisland', ' In this RP, you usually are a Pokemon invited  to compete in a TV series similar to Total Drama Island, where challenges are done and people are voted off by the players. Goal: be the last player standing and not losing the final challenge.',
	'dungeonsanddragons', 'The host is the gamemaster, taking control of the RP\'s setting, plot, and other things, such as doing the rolls usually in front of the players. The players choose a class from the host\'s document, then fight various battles and go through the host\'s scenario\/"campaign".',
	'goodvsevil', 'In this RP, two sides, the particular Good and Evil \'sides\', duke it out in PS! battles until one of the sides is victorious. Each team has a leader, which decide the setting of what they\'re protecting, and control how the groups attack. http://tinyurl.com/gudvsevil'
];

exports.commands = {
    setrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!Bot.hasRank(by, '%@#&~')) return false;
		if (currentRP) {
			Bot.say(by, room, 'There is currently an RP going on. Please end it before starting another one.')
			return false;
		}
		if (!Bot.hasRank(by, '~') || room !== rpRoom) return false;
		if (rpModes.indexOf(toId(arg)) > -1 && rpModes.indexOf(toId(arg)) % 2 === 0) {
			currentRP = arg;
			Bot.say(by, room, 'The current RP is set to: ' + arg);
			Bot.say(by, room, rpModes[rpModes.indexOf(toId(arg)) + 1])
		}
		else {
			var text = 'Invalid RP Mode; modes include: ';
			for (var i = 0; i < rpModes.length; i++) {
				text += rpModes[i] + ', ';
				i++
			}
			Bot.say(by, room, text);
		}
	},
	endrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!Bot.hasRank(by, '~')) return false;
		if (!currentRP) {
			Bot.say(by, room, 'There is currently no RP going on.');
			return false;
		}
		currentRP = '';
		Bot.say(by, room, 'The RP has been ended.');
	},
	rp: function(arg, by, room) {
		if (room !== rpRoom && room.charAt(0) !== ',') return false;
		if (Bot.hasRank(by, '~') || room.charAt(0) === ',') {
			var text = 'The current RP is ';
		}
		else {
			var text = '/w ' + by + ', The current RP is ';
		}
		if (!currentRP) {
			text += 'not yet set.';
			Bot.say(by, room, text);
			return false;
		}
		text += rpModes[rpModes.indexOf(toId(currentRP))];
		Bot.say(by, room, text);

		if (!Bot.hasRank(by, '~') || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/w ' + by + ', ';
		}
		text += rpModes[rpModes.indexOf(toId(currentRP)) + 1];
		Bot.say(by, room, text);
	},
	startrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!Bot.hasRank(by, '~')) return false;
		Bot.say(by, room, 'The RP has started.')
		rpTimer = setTimeout(function() {
			Bot.say(config.nick, room, 'The RP is now over.');
			currentRP = '';
		}.bind(this), 8 * 60 * 60 * 1000);
	},
}