/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */
var pokemonData = require('./battle/pokemonData.js').BattleFormatsData;

function game(game, room) {
	if (!colors) global.colors = require('colors');
	console.log('game'.yellow + '    ['.blue + room.blue + '] '.blue + 'A game of ' + game.trim() + ' started');
}

var ascii = ' \~\!\@\#\$\%\^\&\*\(\)\_\+\`1234567890\-\=qwertyuiop\[\]\\QWERTYUIOP\{\}\|\'\;lkjhgfdsaASDFGHJKL\:\"zxcvbnm\,\.\/ZXCVBNM\<\>\?'

var crazyeight = {
	playerData: {},
	playerList: {},
	deck: {},
	gameStatus: {},
	interval: {},
	currentPlayer: {},
	topCard: {},
};

var deck = {};
var playerData = {};
var playerCount = {};
var gameStatus = {};
var blackJack = {};
var currentPlayer = {};

var http = require('http');
var sys = require('sys');
var https = require('https');
var csv = require('csv-parse');

//
var anagramInterval = {};
var anagramA = {};
var anagramON = {};
var anagramPoints = {};
//
var hangmanWords = [
	'missingno', 'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard', 'squirtle', 'wartortle', 'blastoise', 'caterpie', 'metapod', 'butterfree', 'weedle', 'kakuna', 'beedrill', 'pidgey', 'pidgeotto', 'pidgeot', 'rattata', 'raticate', 'spearow', 'fearow', 'ekans', 'arbok', 'pikachu', 'raichu', 'sandshrew', 'sandslash', 'nidoranf', 'nidorina', 'nidoqueen', 'nidoranm', 'nidorino', 'nidoking', 'cle', 'clefable', 'vulpix', 'ninetales', 'jigglypuff', 'wigglytuff', 'zubat', 'golbat', 'oddish', 'gloom', 'vileplume', 'paras', 'parasect', 'venonat', 'venomoth', 'diglett', 'dugtrio', 'meowth', 'persian', 'psyduck', 'golduck', 'mankey', 'primeape', 'growlithe', 'arcanine', 'poliwag', 'poliwhirl', 'poliwrath', 'abra', 'kadabra', 'alakazam', 'machop', 'machoke', 'machamp', 'bellsprout', 'weepinbell', 'victreebel', 'tentacool', 'tentacruel', 'geodude', 'graveler', 'golem', 'ponyta', 'rapidash', 'slowpoke', 'slowbro', 'magnemite', 'magneton', 'farfetchd', 'doduo', 'dodrio', 'seel', 'dewgong', 'grimer', 'muk', 'shellder', 'cloyster', 'gastly', 'haunter', 'gengar', 'onix', 'drowzee', 'hypno', 'krabby', 'kingler', 'voltorb', 'electrode', 'exeggcute', 'exeggutor', 'cubone', 'marowak', 'hitmonlee', 'hitmonchan', 'lickitung', 'koffing', 'weezing', 'rhyhorn', 'rhydon', 'chansey', 'tangela', 'kangaskhan', 'horsea', 'seadra', 'goldeen', 'seaking', 'staryu', 'starmie', 'mr.mime', 'scyther', 'jynx', 'electabuzz', 'magmar', 'pinsir', 'tauros', 'magikarp', 'gyarados', 'lapras', 'ditto', 'eevee', 'vaporeon', 'jolteon', 'flareon', 'porygon', 'omanyte', 'omastar', 'kabuto', 'kabutops', 'aerodactyl', 'snorlax', 'articuno', 'zapdos', 'moltres', 'dratini', 'dragonair', 'dragonite', 'mewtwo', 'mew', 'chikorita', 'bayleef', 'meganium', 'cyndaquil', 'quilava', 'typhlosion', 'totodile', 'croconaw', 'feraligatr', 'sentret', 'furret', 'hoothoot', 'noctowl', 'ledyba', 'ledian', 'spinarak', 'ariados', 'crobat', 'chinchou', 'lanturn', 'pichu', 'cleffa', 'igglybuff', 'togepi', 'togetic', 'natu', 'xatu', 'mareep', 'flaaffy', 'ampharos', 'bellossom', 'marill', 'azumarill', 'sudowoodo', 'politoed', 'hoppip', 'skiploom', 'jumpluff', 'aipom', 'sunkern', 'sunflora', 'yanma', 'wooper', 'quagsire', 'espeon', 'umbreon', 'murkrow', 'slowking', 'misdreavus', 'unown', 'wobbuffet', 'girafarig', 'pineco', 'forretress', 'dunsparce', 'gligar', 'steelix', 'snubbull', 'granbull', 'qwilfish', 'scizor', 'shuckle', 'heracross', 'sneasel', 'teddiursa', 'ursaring', 'slugma', 'magcargo', 'swinub', 'piloswine', 'corsola', 'remoraid', 'octillery', 'delibird', 'mantine', 'skarmory', 'houndour', 'houndoom', 'kingdra', 'phanpy', 'donphan', 'porygon2', 'stantler', 'smeargle', 'tyrogue', 'hitmontop', 'smoochum', 'elekid', 'magby', 'miltank', 'blissey', 'raikou', 'entei', 'suicune', 'larvitar', 'pupitar', 'tyranitar', 'lugia', 'hooh', 'celebi', 'treecko', 'grovyle', 'sceptile', 'torchic', 'combusken', 'blaziken', 'mudkip', 'marshtomp', 'swampert', 'poochyena', 'mightyena', 'zigzagoon', 'linoone', 'wurmple', 'silcoon', 'beautifly', 'cascoon', 'dustox', 'lotad', 'lombre', 'ludicolo', 'seedot', 'nuzleaf', 'shiftry', 'taillow', 'swellow', 'wingull', 'pelipper', 'ralts', 'kirlia', 'gardevoir', 'surskit', 'masquerain', 'shroomish', 'breloom', 'slakoth', 'vigoroth', 'slaking', 'nincada', 'ninjask', 'shedinja', 'whismur', 'loudred', 'exploud', 'makuhita', 'hariyama', 'azurill', 'nosepass', 'skitty', 'delcatty', 'sableye', 'mawile', 'aron', 'lairon', 'aggron', 'meditite', 'medicham', 'electrike', 'manectric', 'plusle', 'minun', 'volbeat', 'illumise', 'roselia', 'gulpin', 'swalot', 'carvanha', 'sharpedo', 'wailmer', 'wailord', 'numel', 'camerupt', 'torkoal', 'spoink', 'grumpig', 'spinda', 'trapinch', 'vibrava', 'flygon', 'cacnea', 'cacturne', 'swablu', 'altaria', 'zangoose', 'seviper', 'lunatone', 'solrock', 'barboach', 'whiscash', 'corphish', 'crawdaunt', 'baltoy', 'claydol', 'lileep', 'cradily', 'anorith', 'armaldo', 'feebas', 'milotic', 'castform', 'kecleon', 'shuppet', 'banette', 'duskull', 'dusclops', 'tropius', 'chimecho', 'absol', 'wynaut', 'snorunt', 'glalie', 'spheal', 'sealeo', 'walrein', 'clamperl', 'huntail', 'gorebyss', 'relicanth', 'luvdisc', 'bagon', 'shelgon', 'salamence', 'beldum', 'metang', 'metagross', 'regi', 'reg', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys', 'turtwig', 'grotle', 'torterra', 'chimchar', 'monferno', 'infernape', 'piplup', 'prinplup', 'empoleon', 'starly', 'staravia', 'staraptor', 'bidoof',
	'bibarel', 'kricketot', 'kricketune', 'shinx', 'luxio', 'luxray', 'budew', 'roserade', 'cranidos', 'rampardos', 'shieldon', 'bastiodon', 'burmy', 'wormadam', 'mothim', 'combee', 'vespiquen', 'pachirisu', 'buizel', 'floatzel', 'cherubi', 'cherrim', 'shellos', 'gastrodon', 'ambipom', 'drifloon', 'drifblim', 'buneary', 'lopunny', 'mismagius', 'honchkrow', 'glameow', 'purugly', 'chingling', 'stunky', 'skuntank', 'bronzor', 'bronzong', 'bonsly', 'mimejr.', 'happiny', 'chatot', 'spiritomb', 'gible', 'gabite', 'garchomp', 'munchlax', 'riolu', 'lucario', 'hippopotas', 'hippowdon', 'skorupi', 'drapion', 'croagunk', 'toxicroak', 'carnivine', 'finneon', 'lumineon', 'mantyke', 'snover', 'abomasnow', 'weavile', 'magnezone', 'lickilicky', 'rhyperior', 'tangrowth', 'electivire', 'magmortar', 'togekiss', 'yanmega', 'leafeon', 'glaceon', 'gliscor', 'mamoswine', 'porygonz', 'gallade', 'probopass', 'dusknoir', 'froslass', 'rotom', 'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus', 'victini', 'snivy', 'servine', 'serperior', 'tepig', 'pignite', 'emboar', 'oshawott', 'dewott', 'samurott', 'patrat', 'watchog', 'lillipup', 'herdier', 'stoutland', 'purrloin', 'liepard', 'pansage', 'simisage', 'pansear', 'simisear', 'panpour', 'simipour', 'munna', 'musharna', 'pidove', 'tranquill', 'unfezant', 'blitzle', 'zebstrika', 'roggenrola', 'boldore', 'gigalith', 'woobat', 'swoobat', 'drilbur', 'excadrill', 'audino', 'timburr', 'gurdurr', 'conkeldurr', 'tympole', 'palpitoad', 'seismitoad', 'throh', 'sawk', 'sewaddle', 'swadloon', 'leavanny', 'venipede', 'whirlipede', 'scolipede', 'cottonee', 'whimsicott', 'petilil', 'lilligant', 'basculin', 'sandile', 'krokorok', 'krookodile', 'darumaka', 'darmanitan', 'maractus', 'dwebble', 'crustle', 'scraggy', 'scrafty', 'sigilyph', 'yamask', 'cofagrigus', 'tirtouga', 'carracosta', 'archen', 'archeops', 'trubbish', 'garbodor', 'zorua', 'zoroark', 'minccino', 'cinccino', 'gothita', 'gothorita', 'gothitelle', 'solosis', 'duosion', 'reuniclus', 'ducklett', 'swanna', 'vanillite', 'vanillish', 'vanilluxe', 'deerling', 'sawsbuck', 'emolga', 'karrablast', 'escavalier', 'foongus', 'amoonguss', 'frillish', 'jellnt', 'alomomola', 'joltik', 'galvantula', 'ferroseed', 'ferrothorn', 'klink', 'klang', 'klinklang', 'tynamo', 'eelektrik', 'eelektross', 'elgyem', 'beheeyem', 'litwick', 'lampent', 'chandelure', 'axew', 'fraxure', 'haxorus', 'cubchoo', 'beartic', 'cryogonal', 'shelmet', 'accelgor', 'stunfisk', 'mienfoo', 'mienshao', 'druddigon', 'golett', 'golurk', 'pawniard', 'bisharp', 'bouffalant', 'rufflet', 'braviary', 'vullaby', 'mandibuzz', 'heatmor', 'durant', 'deino', 'zweilous', 'hydreigon', 'larvesta', 'volcarona', 'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem', 'keldeo', 'meloetta', 'genesect', 'chespin', 'quilladin', 'chesnaught', 'fennekin', 'braixen', 'delphox', 'froakie', 'frogadier', 'greninja', 'bunnelby', 'diggersby', 'fletchling', 'fletchinder', 'talonflame', 'scatterbug', 'spewpa', 'vivillon', 'litleo', 'pyroar', 'flabebe', 'floette', 'florges', 'skiddo', 'gogoat', 'pancham', 'pangoro', 'furfrou', 'espurr', 'meowstic', 'honedge', 'doublade', 'aegislash', 'spritzee', 'aromatisse', 'swirlix', 'slurpuff', 'inkay', 'malamar', 'binacle', 'barbaracle', 'skrelp', 'dragalge', 'clauncher', 'clawitzer', 'helioptile', 'heliolisk', 'tyrunt', 'tyrantrum', 'amaura', 'aurorus', 'sylveon', 'hawlucha', 'dedenne', 'carbink', 'goomy', 'sliggoo', 'goodra', 'klefki', 'phantump', 'trevenant', 'pumpkaboo', 'gourgeist', 'bergmite', 'avalugg', 'noibat', 'noivern', 'xerneas', 'yveltal', 'zygarde', 'diancie', 'hoopa', 'volcanion'
];
var hangmanON = {};
var hangmanDes = {};
var hangmanA = {};
var hangmanQ = {};
var hangmanInterval = {};
var hangmanProgress = {};
var hangmanChances = {};
//RP based variables
var rpTimer;
var rpRoom = 'roleplaying';
var currentRP;
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
// TRIVIA BASED VARIABLES
var triviaON = {};
var triviaTimer = {};
var triviaA = {};
var triviaQ = {};
var triviaPoints = {};
var triviaQuestions = fs.readFileSync('data/trivia.txt').toString().split('\n');

exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */
	credits: 'about',
	about: function(arg, by, room) {
		if (this.hasRank(by, '#&~') || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		text += 'Hi!!! n_n I\'m sparkychild\'s PS Bot - Based on Pokémon Showdown Bot by: Quinella, TalkTakesTime, and Morfent';
		this.say(by, room, text);
	},
	guide: function(arg, by, room) {
		var text = '';
		if (!this.hasRank(by, '&#~') && room.charAt(0) !== ',') {
			text += '/w ' + by + ','
		}
		if (config.botguide) {
			text += 'A guide on how to use this bot can be found here: ' + config.botguide;
		}
		else {
			text += 'There is no guide for this bot. PM the owner with any questions.';
		}
		this.say(by, room, text);
		if (this.rankFrom(by, '@')) {
			this.say(by, ',' + by, 'Bot Staff guide: http://pastebin.com/t8e7UBV2')
		}
	},

	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */
	join: function(arg, by, room) {
		if (room.charAt(0) !== ',') return false;
		send('|/join ' + arg);
	},
	js: function(arg, user, room) {
		if (!this.isDev(user)) return false;
		try {
			var result = eval(arg.trim());
			this.talk(room, JSON.stringify(result));
		}
		catch (e) {
			this.talk(room, e.name + ": " + e.message);
		}
	},
	reload: function(arg, by, room) {
		if (!this.isDev(by)) return false;
		for (var tarRoom in triviaON) {
			if (triviaON[tarRoom]) {
				return this.say(by, room, 'Trivia game going on.')
			}
		}
		for (var tarRoom in hangmanON) {
			if (hangmanON[tarRoom]) {
				return this.say(by, room, 'Hangman game going on.')
			}
		}
		for (var tarRoom in anagramON) {
			if (anagramON[tarRoom]) {
				return this.say(by, room, 'Anagram game going on.')
			}
		}
		for (var tarRoom in gameStatus) {
			if (gameStatus[tarRoom] !== 'off') {
				return this.say(by, room, 'Blackjack game going on.')
			}
		}
		for (var tarRoom in crazyeight.gameStatus) {
			if (crazyeight.gameStatus[tarRoom] !== 'off') {
				return this.say(by, room, 'C8 game going on.')
			}
		}
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.uncacheTree('./battle/battle.js');
			try {
				Object.merge(Commands, require('./battle/battle.js').commands);
			}
			catch (e) {
				error("Could not import commands file: Battle | " + sys.inspect(e));
			}
			this.say(by, room, 'Commands reloaded.');
			ok('Commands reloaded.')
		}
		catch (e) {
			error('failed to reload: ' + sys.inspect(e));
		}
	},
	git: function(arg, by, room) {
		if (!this.hasRank(by, '&#~')) room = ',' + by
		return this.say(by, room, 'https://github.com/sparkychild/ChuChuBoTTT', true);
	},
	c: 'custom',
	custom: function(arg, by, room) {
		if (config.excepts.indexOf(toId(by)) === -1 && !this.rankFrom(by, '~')) return false;
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.talk(tarRoom || room, arg);
		// Custom commands can be executed in an arbitrary room using the syntax
		// ".custom [room] command", e.g., to do !data pikachu in the room lobby,
		// the command would be ".custom [lobby] !data pikachu". However, using
		// "[" and "]" in the custom command to be executed can mess this up, so
		// be careful with them.
	},

	/**
	 * Room Owner commands
	 *
	 * These commands allow room owners to personalise settings for moderation and command use.
	 */

	settings: 'set',
	set: function(arg, by, room) {
		if (!this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;

		var settable = {
			randpoke: 1,
			say: 1,
			joke: 1,
			meme: 1,
			crazyeights: 1,
			blackjack: 1,
			addquote: 1,
			autores: 1,
			quote: 1,
			pair: 1,
			choose: 1,
			usagestats: 1,
			buzz: 1,
			'8ball': 1,
			roomkick: 1,
			addcom: 1,
			games: 1,
			wifi: 1,
			runtour: 1,
			autoban: 1,
			banword: 1,
			trivia: 1,
			hangman: 1,
			anagrams: 1
		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1
		};

		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(by, room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings[config.serverid][toId(config.nick)]['modding']) this.settings[config.serverid][toId(config.nick)]['modding'] = {};
			if (!this.settings[config.serverid][toId(config.nick)]['modding'][room]) this.settings[config.serverid][toId(config.nick)]['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#&~')) return false;
				if (!(toId(opts[2]) in {
						on: 1,
						off: 1
					})) return this.say(by, room, 'Incorrect command: correct syntax is ' + config.commandcharacter + 'set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				if (toId(opts[2]) === 'off') {
					this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])] = 0;
				}
				else {
					delete this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])];
				}
				this.writeSettings();
				this.say(by, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			}
			else {
				this.say(by, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
					(this.settings[config.serverid][toId(config.nick)]['modding'][room][toId(opts[1])] === 0 ? 'OFF' : 'ON') + '.');
				return;
			}
		}
		else {
			if (!Commands[cmd]) return this.say(by, room, config.commandcharacter + '' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				}
				else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					}
					else {
						this.say(by, room, 'The settings for ' + config.commandcharacter + '' + opts[0] + ' cannot be changed.');
						return;
					}
				}
				else {
					this.say(by, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(by, room, 'The command "' + config.commandcharacter + '' + opts[0] + '" could not be found.');
					return;
				}
			}

			var settingsLevels = {
				off: false,
				disable: false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[config.serverid][toId(config.nick)][cmd] || (!this.settings[config.serverid][toId(config.nick)][cmd][room] && this.settings[config.serverid][toId(config.nick)][cmd][room] !== false)) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for users of rank ' + ((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank) + ' and above.';
				}
				else if (this.settings[config.serverid][toId(config.nick)][cmd][room] in settingsLevels) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for users of rank ' + this.settings[config.serverid][toId(config.nick)][cmd][room] + ' and above.';
				}
				else if (this.settings[config.serverid][toId(config.nick)][cmd][room] === true) {
					msg = '' + config.commandcharacter + '' + cmd + ' is available for all users in this room.';
				}
				else if (this.settings[config.serverid][toId(config.nick)][cmd][room] === false) {
					msg = '' + config.commandcharacter + '' + cmd + ' is not available for use in this room.';
				}
				this.say(by, room, msg);
				return;
			}
			else {
				if (!this.hasRank(by, '#&~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(by, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
				if (!this.settings[config.serverid][toId(config.nick)][cmd]) this.settings[config.serverid][toId(config.nick)][cmd] = {};
				this.settings[config.serverid][toId(config.nick)][cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(by, room, 'The command ' + config.commandcharacter + '' + cmd + ' is now ' +
					(settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
						(this.settings[config.serverid][toId(config.nick)][cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
			}
		}
	},
	blacklist: 'autoban',
	ban: 'autoban',
	ab: 'autoban',
	autoban: function(arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var added = [];
		var illegalNick = [];
		var alreadyAdded = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(by, room, 'You must specify at least one user to blacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				illegalNick.push(tarUser);
				continue;
			}
			if (!this.blacklistUser(tarUser, room)) {
				alreadyAdded.push(tarUser);
				continue;
			}
			this.say(config.nick, room, '/roomban ' + tarUser + ', Blacklisted user');
			this.say(config.nick, room, '/modnote ' + tarUser + ' was added to the blacklist by ' + by + '.');
			added.push(tarUser);
		}

		var text = '';
		if (added.length) {
			text += 'User(s) "' + added.join('", "') + '" added to blacklist successfully. ';
			this.writeSettings();
		}
		if (alreadyAdded.length) text += 'User(s) "' + alreadyAdded.join('", "') + '" already present in blacklist. ';
		if (illegalNick.length) text += 'All ' + (text.length ? 'other ' : '') + 'users had illegal nicks and were not blacklisted.';
		this.say(by, room, text);
	},
	unblacklist: 'unautoban',
	unban: 'unautoban',
	unab: 'unautoban',
	unautoban: function(arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');

		arg = arg.split(',');
		var removed = [];
		var notRemoved = [];
		if (!arg.length || (arg.length === 1 && !arg[0].trim().length)) return this.say(by, room, 'You must specify at least one user to unblacklist.');
		for (var i = 0; i < arg.length; i++) {
			var tarUser = toId(arg[i]);
			if (tarUser.length < 1 || tarUser.length > 18) {
				notRemoved.push(tarUser);
				continue;
			}
			if (!this.unblacklistUser(tarUser, room)) {
				notRemoved.push(tarUser);
				continue;
			}
			this.say(config.nick, room, '/roomunban ' + tarUser);
			removed.push(tarUser);
		}

		var text = '';
		if (removed.length) {
			text += 'User(s) "' + removed.join('", "') + '" removed from blacklist successfully. ';
			this.writeSettings();
		}
		if (notRemoved.length) text += (text.length ? 'No other ' : 'No ') + 'specified users were present in the blacklist.';
		this.say(by, room, text);
	},
	rab: 'regexautoban',
	regexautoban: function(arg, by, room) {
		if (!this.rankFrom(by, '~') || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(by, room, 'You must specify a regular expression to (un)blacklist.');

		try {
			new RegExp(arg, 'i');
		}
		catch (e) {
			return this.say(by, room, e.message);
		}

		arg = '/' + arg + '/i';
		if (!this.blacklistUser(arg, room)) return this.say(by, room, '/' + arg + ' is already present in the blacklist.');

		this.writeSettings();
		this.say(by, room, '/' + arg + ' was added to the blacklist successfully.');
	},
	unrab: 'unregexautoban',
	unregexautoban: function(arg, by, room) {
		if (!this.rankFrom(by, '~') || !this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;
		if (!this.hasRank(this.ranks[room] || ' ', '@&#~')) return this.say(by, room, config.nick + ' requires rank of @ or higher to (un)blacklist.');
		if (!arg) return this.say(by, room, 'You must specify a regular expression to (un)blacklist.');

		arg = '/' + arg.replace(/\\\\/g, '\\') + '/i';
		if (!this.unblacklistUser(arg, room)) return this.say(by, room, '/' + arg + ' is not present in the blacklist.');

		this.writeSettings();
		this.say(by, room, '/' + arg + ' was removed from the blacklist successfully.');
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function(arg, by, room) {
		if (!this.canUse('autoban', room, by) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings[config.serverid][toId(config.nick)].blacklist || !this.settings[config.serverid][toId(config.nick)].blacklist[room]) {
			text = 'No users are blacklisted in this room.';
		}
		else {
			if (arg.length) {
				var nick = toId(arg);
				if (nick.length < 1 || nick.length > 18) {
					text = 'Invalid nickname: "' + nick + '".';
				}
				else {
					text = 'User "' + nick + '" is currently ' + (nick in this.settings[config.serverid][toId(config.nick)].blacklist[room] ? '' : 'not ') + 'blacklisted in ' + room + '.';
				}
			}
			else {
				var nickList = Object.keys(this.settings[config.serverid][toId(config.nick)].blacklist[room]);
				if (!nickList.length) return this.say(by, room, '/pm ' + by + ', No users are blacklisted in this room.');
				this.uploadToHastebin('The following users are banned in ' + room + ':\n\n' + nickList.join('\n'), function(link) {
					this.say(by, room, "/pm " + by + ", Blacklist for room " + this.rooms[room].name + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(by, room, '/pm ' + by + ', ' + text);
	},
	banphrase: 'banword',
	banword: function(arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases) this.settings[config.serverid][toId(config.nick)].bannedphrases = {};
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] = {};
		if (arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) return this.say(by, room, "Phrase \"" + arg + "\" is already banned.");
		this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom][arg] = 1;
		this.writeSettings();
		this.say(by, room, "Phrase \"" + arg + "\" is now banned.");
	},
	unbanphrase: 'unbanword',
	unbanword: function(arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		if (!arg) return false;
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases || !this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] || !(arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]))
			return this.say(by, room, "Phrase \"" + arg + "\" is not currently banned.");
		delete this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom][arg];
		if (!Object.size(this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom])) delete this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom];
		if (!Object.size(this.settings[config.serverid][toId(config.nick)].bannedphrases)) delete this.settings[config.serverid][toId(config.nick)].bannedphrases;
		this.writeSettings();
		this.say(by, room, "Phrase \"" + arg + "\" is no longer banned.");
	},
	viewbannedphrases: 'viewbannedwords',
	vbw: 'viewbannedwords',
	viewbannedwords: function(arg, by, room) {
		if (!this.canUse('banword', room, by)) return false;
		arg = arg.trim().toLowerCase();
		var tarRoom = room;

		if (room.charAt(0) === ',') {
			if (!this.hasRank(by, '~')) return false;
			tarRoom = 'global';
		}

		var text = "";
		if (!this.settings[config.serverid][toId(config.nick)].bannedphrases || !this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]) {
			text = "No phrases are banned in this room.";
		}
		else {
			if (arg.length) {
				text = "The phrase \"" + arg + "\" is currently " + (arg in this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom] ? "" : "not ") + "banned " +
					(room.charAt(0) === ',' ? "globally" : "in " + room) + ".";
			}
			else {
				var banList = Object.keys(this.settings[config.serverid][toId(config.nick)].bannedphrases[tarRoom]);
				if (!banList.length) return this.say(by, room, "No phrases are banned in this room.");
				this.uploadToHastebin("The following phrases are banned " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ":\n\n" + banList.join('\n'), function(link) {
					this.say(by, room, (room.charAt(0) === ',' ? "" : "/pm " + by + ", ") + "Banned Phrases " + (room.charAt(0) === ',' ? "globally" : "in " + room) + ": " + link);
				}.bind(this));
				return;
			}
		}
		this.say(by, room, text);
	},

	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */
	'meme': function(arg, by, room, con) {
		if (this.canUse('meme', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}

		var rand = ~~(19 * Math.random()) + 1;

		switch (rand) {
			case 1:
				text += "ᕦ( ͡° ͜ʖ ͡°)ᕤ";
				break;
			case 2:
				text += "ᕙ( ͡° ͜ʖ ͡°)ᕗ";
				break;
			case 3:
				text += "(ง ° ͜ ʖ °)ง";
				break;
			case 4:
				text += "( ͡° ͜ʖ ͡°)";
				break;
			case 5:
				text += "ᕙ༼ຈل͜ຈ༽ᕗ";
				break;
			case 6:
				text += "ᕦ( ͡°╭͜ʖ╮͡° )ᕤ";
				break;
			case 7:
				text += "ヽ༼ຈل͜ຈ༽ﾉ raise your dongers. ヽ༼ຈل͜ຈ༽ﾉ ";
				break;
			case 8:
				text += "┴┬┴┤( ͡° ͜ʖ├┬┴┬";
				break;
			case 9:
				text += "╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ";
				break;
			case 10:
				text += "─=≡Σᕕ( ͡° ͜ʖ ͡°)ᕗ";
				break;
			case 11:
				text += "(つ ͡° ͜ʖ ͡°)つ";
				break;
			case 12:
				text += "༼ຈل͜ຈ༽ﾉ·︻̷┻̿═━一";
				break;
			case 13:
				text += "─=≡Σ(((༼つಠ益ಠ༽つ";
				break;
			case 14:
				text += "༼ ºل͟º༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽";
				break;
			case 15:
				text += "ヽ༼ຈل͜ຈ༽ﾉ︵┻━┻";
				break;
			case 16:
				text += "┌∩┐༼ ºل͟º ༽┌∩┐";
				break;
			case 17:
				text += "[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]";
				break;
			case 18:
				text += "( ͡ ͡° ͡° ʖ ͡° ͡°)";
				break;
			case 19:
				text += "(ง ͠° ͟ل͜ ͡°)ง";
				break;
		}
		this.say(by, room, text, true);
	},
	hjk: 'roomkick',
	rk: 'roomkick',
	RKO: 'roomkick',
	rko: 'roomkick',
	roomkick: function(arg, by, room, con) {
		if (!this.canUse('roomkick', room, by)) return false;
		if (!arg) return false;
		if ('@#&~'.indexOf(this.ranks[room]) === -1) return this.say(by, room, 'I require @ or higher to use this.');
		if (toId(arg) === toId(config.nick)) return false;
		if (arg.length > 18) return false;
		var victim = toId(stripCommands(arg));
		if (!this.rooms[room].users[victim]) {
			return this.say(by, room, 'The target isn\'t even in this room!');
		}
		var ranks = ' +★$%@&#~';
		var targetRank = ranks.indexOf(this.rooms[room].users[victim]);
		var thisRank = ranks.indexOf(by.charAt(0));
		var botsRank = ranks.indexOf(this.ranks[room]);
		if (thisRank < targetRank) {
			return this.say(by, room, 'You can\'t kick someone that is of a higher rank!')
		}
		if (botsRank <= targetRank) return false;
		if (this.rankFrom(victim, '+')) {
			return this.say(by, room, 'Access denied :^)');
		}
		this.say(by, room, '/rb ' + victim + ',♥ ^_^ ♥');
		this.say(config.nick, room, '/roomunban ' + victim);
		this.say(config.nick, room, '/modnote ' + victim + ' was rk\'d by ' + by);
	},
	marry: 'pair',
	pair: function(arg, by, room, con) {
		if (!this.canUse('pair', room, by) || !arg) return false;
		var user = toId(by);
		var pairing = toId(arg);

		function toBase(num, base) {
			var symbols = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
			var num = num.split("");
			var conversion = "";
			var val;
			var total = 0;

			if (base > symbols.length || base <= 1) return false;

			for (i = 0; i < num.length; i++) {
				val = symbols.indexOf(num[i]);
				total += ((val % base) * Math.pow(10, i)) + (Math.floor(val / base) * Math.pow(10, i + 1));
			}
			return parseInt(total);
		}

		user = toBase(user, 10);
		pairing = toBase(pairing, 10);
		var match = (user + pairing) % 101;

		this.say(by, room, by + ' and ' + arg + ' are ' + match + '% compatible!!!!');
	},
	tell: 'say',
	say: function(arg, by, room) {
		if (!this.canUse('say', room, by)) return false;
		this.say(by, room, stripCommands(arg));
	},
	joke: function(arg, by, room) {
		if (!this.canUse('joke', room, by) || room.charAt(0) === ',') room = ',' + toId(by);
		var self = this;

		var reqOpt = {
			hostname: 'api.icndb.com',
			path: '/jokes/random',
			method: 'GET'
		};
		var req = http.request(reqOpt, function(res) {
			res.on('data', function(chunk) {
				try {
					var data = JSON.parse(chunk);
					self.say(by, room, data.value.joke.replace(/&quot;/g, "\""));
				}
				catch (e) {
					self.say(by, room, 'Sorry, couldn\'t fetch a random joke... :(');
				}
			});
		});
		req.end();
	},
	choose: function(arg, by, room) {
		if (arg.indexOf(',') === -1) {
			var choices = arg.split(' ');
		}
		else {
			var choices = arg.split(',');
		}
		choices = choices.filter(function(i) {
			return (toId(i) !== '')
		});
		if (choices.length < 2) return this.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + config.commandcharacter + 'choose: You must give at least 2 valid choices.');

		var choice = choices[Math.floor(Math.random() * choices.length)];
		this.say(by, room, ((this.canUse('choose', room, by) || room.charAt(0) === ',') ? '' : '/pm ' + by + ', ') + stripCommands(choice));
	},
	usage: 'usagestats',
	usagedata: 'usagestats',
	monousage: 'usagestats',
	usagestats: function(arg, by, room, cmd) {
		var usageLink = 'http://www.smogon.com/stats/2015-08/'
		if (this.canUse('usagestats', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		if (!arg) {
			text += usageLink;
			return this.say(by, room, text);
		}
		var arg = arg.split(',');
		switch (arg.length) {
			case 3:
				var targetRank = arg[2].replace(/[^0-9]/g, '');
			case 2:
				var targetTier = arg[1].toLowerCase().replace(/[^a-z0-9]/g, '');
			case 1:
				var targetPoke = toId(arg[0]);
				break;
		}
		//get data from a website:
		function getData(link, callback) {
			http.get(link, function(res) {
				var data = '';
				res.on('data', function(part) {
					data += part
				});
				res.on('end', function(end) {
					callback(data);
				});
			});
		}

		//determine tier
		if (!targetTier) {
			switch (room) {
				case 'uu':
				case 'underused':
					targetTier = 'uu';
					break;
				case 'rarelyused':
				case 'ru':
				case 'therulers':
					targetTier = 'ru'
					break;
				case 'pu':
					targetTier = 'pu';
					break;
				case 'lc':
				case 'littlecup':
					targetTier = 'lc';
					break;
				case 'overused':
				case 'ou':
					targetTier = 'ou';
					break;
				default:
					//determine a pokemon's tier from showdown's data
					if (!pokemonData[targetPoke]) {
						return this.say(by, room, text + 'Invalid Pokemon');
					}
					var targetTier = toId(pokemonData[targetPoke].tier);
					if (targetTier === 'nfe') {
						targetTier = 'pu';
					}
					break;
			}
		}
		var destination = targetTier + '-' + (targetRank || '1500') + '.txt';
		if (cmd !== 'monousage') {
			var index;
			getData(usageLink + destination, function(data) {
				var usageStats = data.split('\n');
				if (usageStats[0].indexOf(' Total battles:') === -1) {
					return this.say(by, room, text + 'ERROR: Invalid Tier/Failed to get data.')
				}
				for (var i = 5; i < usageStats.length; i++) {
					var tarStats = usageStats[i].replace(/ /g, '').split('|');
					if (!tarStats[2]) {
						continue;
					}
					if (toId(tarStats[2]) === targetPoke) {
						index = i - 5;
						return this.say(by, room, text + tarStats[2] + ' - #' + tarStats[1] + ' in ' + targetTier.toUpperCase() + '| Usage: ' + tarStats[3] + '| Raw Count: ' + tarStats[4])
					}
				};
				return this.say(by, room, text + 'Pokémon not found.')
			}.bind(this));
			if (cmd === 'usagedata') {
				getData(usageLink + 'moveset/' + destination, function(data) {
					data = data.split(' +----------------------------------------+ \n +----------------------------------------+ ');
					var moveSetData = data[index];
					if (!moveSetData) {
						return this.say(by, room, 'Error in parsing data.');
					}
					var tarData = moveSetData.split('\n');
					var moves = '';
					var teammates = '';
					var items = [];
					var checks = [];
					for (var i = 0; i < tarData.length; i++) {
						if (toId(tarData[i]) === 'moves') {
							moves = tarData.slice(i + 1, i + 5).join(', ').replace(/[^A-Za-z\,\s]/g, '').replace(/[\s]{2,}/g, '').replace(/,/g, ', ');
						}
						if (toId(tarData[i]) === 'items') {
							for (var j = 1; j < 8; j++) {
								if (!tarData[i + j] || !toId(tarData[i + j])) {
									break;
								}
								items.push(tarData[(i + j)].replace(/[^A-Za-z\s]/g, '').replace(/[\s]{2,}/g, ''));
							}
						}
						if (toId(tarData[i]) === 'teammates') {
							teammates = tarData.slice(i + 1, i + 5).join(', ').replace(/[^A-Za-z\,\s]/g, '').replace(/[\s]{2,}/g, '').replace(/,/g, ', ');
						}
						if (toId(tarData[i]) === 'checksandcounters') {
							for (var j = 1; j < 8; j = j + 2) {
								if (!tarData[i + j]) {
									continue;
								}
								checks.push(tarData[(i + j)].split(' ')[2]);
							}
						}
					}
					this.say(by, room, text + 'Common moves are: __' + moves.trim() + '__ **|** Common items include: __' + items.join(', ').trim() + '__');
					this.say(by, room, text + 'Common partners include: __' + teammates.trim() + '__ **|** Commonly used checks and counters: __' + checks.join(', ') + '__.')
				}.bind(this))
			}
		}
		else {
			if (!targetTier) {
				return this.say(by, room, 'Please include the type.')
			}
			getData(usageLink + '/monotype/monotype-mono' + destination.replace('mono', ''), function(data) {
				var usageStats = data.split('\n');
				if (usageStats[0].indexOf(' Total battles:') === -1) {
					return this.say(by, room, text + 'ERROR: Invalid type/Failed to get data.')
				}
				for (var i = 5; i < usageStats.length; i++) {
					var tarStats = usageStats[i].replace(/ /g, '').split('|');
					if (!tarStats[2]) {
						continue;
					}
					if (toId(tarStats[2]) === targetPoke) {
						index = i - 5;
						return this.say(by, room, text + tarStats[2] + ' - #' + tarStats[1] + ' in ' + targetTier.toUpperCase() + '| Usage: ' + tarStats[3] + '| Raw Count: ' + tarStats[4])
					}
				};
				return this.say(by, room, text + 'Pokémon not found.')
			}.bind(this))
		}
	},
	seen: function(arg, by, room) { // this command is still a bit buggy
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		arg = toId(arg);
		if (!arg || arg.length > 18) return this.say(by, room, text + 'Invalid username.');
		if (arg === toId(by)) {
			text += 'Have you looked in the mirror lately?';
		}
		else if (arg === toId(config.nick)) {
			text += 'You might be either blind or illiterate. Might want to get that checked out.';
		}
		else if (!this.chatData[arg] || !this.chatData[arg].seenAt) {
			text += 'The user ' + arg + ' has never been seen.';
		}
		else {
			text += arg + ' was last seen ' + this.getTimeAgo(this.chatData[arg].seenAt) + ' ago' + (
				this.chatData[arg].lastSeen ? ', ' + this.chatData[arg].lastSeen : '.');
		}
		this.say(by, room, text);
	},
	'8ball': function(arg, by, room) {
		if (this.canUse('8ball', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		by = toId(by);
		if (!arg) return false;

		var alpha = ' abcdefghijklmnopqrstuvwxyz'
		arg = toId(arg).split('');
		var rand = 0;
		for (var i = 0; i < arg.length; i++) {
			rand += alpha.indexOf(arg[i]);
		}
		for (var i = 0; i < by.length; i++) {
			rand += alpha.indexOf(by.charAt(i));
		}


		switch ((rand % 20) + 1) {
			case 1:
				text += "Signs point to yes.";
				break;
			case 2:
				text += "Yes.";
				break;
			case 3:
				text += "Reply hazy, try again.";
				break;
			case 4:
				text += "Without a doubt.";
				break;
			case 5:
				text += "My sources say no.";
				break;
			case 6:
				text += "As I see it, yes.";
				break;
			case 7:
				text += "You may rely on it.";
				break;
			case 8:
				text += "Concentrate and ask again.";
				break;
			case 9:
				text += "Outlook not so good.";
				break;
			case 10:
				text += "It is decidedly so.";
				break;
			case 11:
				text += "Better not tell you now.";
				break;
			case 12:
				text += "Very doubtful.";
				break;
			case 13:
				text += "Yes - definitely.";
				break;
			case 14:
				text += "It is certain.";
				break;
			case 15:
				text += "Cannot predict now.";
				break;
			case 16:
				text += "Most likely.";
				break;
			case 17:
				text += "Ask again later.";
				break;
			case 18:
				text += "My reply is no.";
				break;
			case 19:
				text += "Outlook good.";
				break;
			case 20:
				text += "Don't count on it.";
				break;
		}
		this.say(by, room, text);
	},

	/**
	 * Jeopardy commands
	 *
	 * The following commands are used for Jeopardy in the Academics room
	 * on the Smogon server.
	 */



	b: 'buzz',
	buzz: function(arg, by, room) {
		if (this.buzzed || !this.canUse('buzz', room, by) || room.charAt(0) === ',') return false;
		this.say(by, room, '**' + by.substr(1) + ' has buzzed in!**');
		this.buzzed = by;
		this.buzzer = setTimeout(function(room, buzzMessage) {
			this.say(config.nick, room, buzzMessage);
			this.buzzed = '';
		}.bind(this), 7 * 1000, room, by + ', your time to answer is up!');
	},
	reset: function(arg, by, room) {
		if (!this.buzzed || !this.hasRank(by, '%@&#~') || room.charAt(0) === ',') return false;
		clearTimeout(this.buzzer);
		this.buzzed = '';
		this.say(by, room, 'The buzzer has been reset.');
	},
	trivia: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('trivia', room, by)) return false;
		if (triviaON[room]) {
			this.say(by, room, 'A trivia game cannot be started, as it is going on in another room.');
			return false;
		}
		triviaON[room] = true;
		triviaPoints[room] = [];
		triviaA[room] = '';
		game('trivia', room);
		this.say(by, room, 'Hosting a game of trivia\. First to 10 points wins!  use ' + config.commandcharacter[0] + 'ta or ' + config.commandcharacter[0] + 'triviaanswer to submit your answer\.');
		triviaTimer[room] = setInterval(function() {
			if (triviaA[room]) {
				this.say(config.nick, room, 'The correct answer is: ' + triviaA[room]);
			}
			var TQN = 2 * (Math.floor(triviaQuestions.length * Math.random() / 2))
			triviaQ[room] = triviaQuestions[TQN];
			triviaA[room] = triviaQuestions[TQN + 1];
			this.say(config.nick, room, 'Question: __' + triviaQ[room] + '__');
		}.bind(this), 17000);

	},
	ta: 'triviaanswer',
	triviaanswer: function(arg, by, room) {
		if (!triviaON[room]) return false;
		arg = toId(arg);
		if (!arg) return false;
		var user = toId(by);
		if (arg === triviaA[room]) {
			if (triviaPoints[room].indexOf(user) > -1) {
				triviaA[room] = '';
				triviaPoints[room][triviaPoints[room].indexOf(user) + 1] = triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + 1;
				if (triviaPoints[room][triviaPoints[room].indexOf(user) + 1] >= 10) {
					clearInterval(triviaTimer[room]);
					this.say(config.nick, room, 'Congrats to ' + by + ' for winning!');
					triviaON[room] = false;
					return false;
				}
				this.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + ' points!');
			}
			else {
				triviaA[room] = '';
				triviaPoints[room][triviaPoints[room].length] = user;
				triviaPoints[room][triviaPoints[room].length] = 1;
				this.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + triviaPoints[room][triviaPoints[room].indexOf(user) + 1] + ' point!');
			}
		}
	},
	endtrivia: 'triviaend',
	triviaend: function(arg, by, room) {
		if (!this.canUse('trivia', room, by)) return false;
		clearInterval(triviaTimer[room]);
		if (!triviaON[room]) return false;
		this.say(by, room, 'The game of trivia has been ended.');
		triviaON[room] = false;
	},
	repeat: function(arg, by, room) {
		if (room.charAt(0) === ',') return false;
		if (!arg) return false;

		if (!this.hasRank(by, '#') || !this.rankFrom(by, '+')) return false;
		if (this.repeatON[room]) {
			return this.say(by, room, 'There is already a repeat happening in this room.')
		}

		var spl = arg.split(',');
		var tarTime = spl[0].replace(/[^0-9\.]/g, '') * 60 * 1000;
		if (!spl[0] || !spl[1]) {
			this.say(by, room, 'The format is repeat [minutes], [text]');
			return false;
		}
		if (isNaN(tarTime) || tarTime < 5 * 60000) {
			return this.say(by, room, 'Please use a valid time interval more than 5 minutes.')
		}
		this.say(by, room, 'I will be repeating that text once every ' + tarTime / 60000 + ' minutes.');
		this.repeatON[room] = true;
		this.repeatText[room] = setInterval(function() {
			this.talk(room, stripCommands(spl.slice(1).join(',').trim()).replace('//wall', '/wall').replace('//declare', '/declare'));
		}.bind(this), tarTime);
	},
	stoprepeat: function(arg, by, room) {
		if (room.charAt(0) === ',') return false;
		if (!this.hasRank(by, '#') && !this.repeatON[room]) return false;
		clearInterval(this.repeatText[room]);
		this.say(by, room, 'This repeat was ended');
		delete this.repeatON[room];
	},
	triviapoints: function(arg, by, room) {
		if (!triviaON[room]) return false;
		if (!this.canUse('trivia', room, by)) return false;
		var text = 'Points so far: '
		for (var i = 0; i < triviaPoints[room].length; i++) {
			text += '' + triviaPoints[room][i] + ': ';
			text += triviaPoints[room][i + 1] + ' points, ';
			i++
		}
		this.say(by, room, text);
	},
	setrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!this.hasRank(by, '%@#&~')) return false;
		if (currentRP) {
			this.say(by, room, 'There is currently an RP going on. Please end it before starting another one.')
			return false;
		}
		if (!this.hasRank(by, '~') || room !== rpRoom) return false;
		if (rpModes.indexOf(toId(arg)) > -1 && rpModes.indexOf(toId(arg)) % 2 === 0) {
			currentRP = arg;
			this.say(by, room, 'The current RP is set to: ' + arg);
			this.say(by, room, rpModes[rpModes.indexOf(toId(arg)) + 1])
		}
		else {
			var text = 'Invalid RP Mode; modes include: ';
			for (var i = 0; i < rpModes.length; i++) {
				text += rpModes[i] + ', ';
				i++
			}
			this.say(by, room, text);
		}
	},
	endrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!this.hasRank(by, '~')) return false;
		if (!currentRP) {
			this.say(by, room, 'There is currently no RP going on.');
			return false;
		}
		currentRP = '';
		this.say(by, room, 'The RP has been ended.');
	},
	rp: function(arg, by, room) {
		if (room !== rpRoom && room.charAt(0) !== ',') return false;
		if (this.hasRank(by, '~') || room.charAt(0) === ',') {
			var text = 'The current RP is ';
		}
		else {
			var text = '/w ' + by + ', The current RP is ';
		}
		if (!currentRP) {
			text += 'not yet set.';
			this.say(by, room, text);
			return false;
		}
		text += rpModes[rpModes.indexOf(toId(currentRP))];
		this.say(by, room, text);

		if (!this.hasRank(by, '~') || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/w ' + by + ', ';
		}
		text += rpModes[rpModes.indexOf(toId(currentRP)) + 1];
		this.say(by, room, text);
	},
	startrp: function(arg, by, room) {
		if (room !== rpRoom) return false;
		if (!this.hasRank(by, '~')) return false;
		this.say(by, room, 'The RP has started.')
		rpTimer = setTimeout(function() {
			this.say(config.nick, room, 'The RP is now over.');
			currentRP = '';
		}.bind(this), 8 * 60 * 60 * 1000);
	},
	hangman: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('hangman', room, by)) return false;
		if (hangmanON[room]) {
			this.say(by, room, 'A game of Hangman is already in progress. Please wait for it to end before starting another.');
			return false;
		}
		this.say(by, room, 'Hosting a game of Hangman! Use ' + config.commandcharacter[0] + 'g to guess letter or word. It will be Pokémon related.')
		game('hangman', room);
		hangmanON[room] = true;
		hangmanChances[room] = 0;
		var HQN = Math.floor(hangmanWords.length * Math.random());
		var spl = hangmanWords[HQN].split('||');
		hangmanDes[room] = '';
		hangmanA[room] = spl[0];
		if (spl[1]) {
			hangmanDes[room] = spl[1];
		}
		hangmanProgress[room] = '';
		for (var i = 0; i < hangmanA[room].length; i++) hangmanProgress[room] += '_ ';
		hangmanProgress[room] += '| ';
		this.talk(room, hangmanProgress[room]);
		hangmanInterval[room] = setInterval(function() {
			this.talk(room, hangmanProgress[room]);
		}.bind(this), 15000);
	},
	endhangman: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('hangman', room, by)) return false;
		clearInterval(hangmanInterval[room]);
		if (!hangmanON[room]) return false;
		hangmanON[room] = false;
		this.say(by, room, 'The game of hangman has been ended. The answer was ' + hangmanA[room] + '.');
		if (!hangmanDes[room]) return false;
		if (hangmanDes[room].indexOf('http') > -1) {
			this.say(config.nick, room, 'For a tutorial/information about this dance style/term, click this following link: ' + hangmanDes[room])
		}
		else {
			this.say(config.nick, room, 'The definition of this word is: ' + hangmanDes[room])
		}
	},
	g: 'guesshangman',
	guesshangman: function(arg, by, room) {
		if (!hangmanON[room]) return false;
		if (!toId(arg)) return false;
		if (hangmanProgress[room].indexOf(' ' + toId(arg) + ' ') > -1) return false;
		if (toId(arg).length > 1) {
			if (toId(arg) === hangmanA[room]) {
				clearInterval(hangmanInterval[room]);
				this.say(config.nick, room, 'Congrats, ' + by + ' got the correct answer!');
				hangmanA[room] = '';
				hangmanON[room] = false;
				if (!hangmanDes[room]) return false;
				if (hangmanDes[room].indexOf('http') > -1) {
					this.say(config.nick, room, 'For a tutorial/information about this dance style/term, click this following link: ' + hangmanDes[room])
				}
				else {
					this.say(config.nick, room, 'The definition of this word is: ' + hangmanDes[room])
				}

			}
			else {
				hangmanProgress[room] += toId(arg) + ' ';
				hangmanChances[room]++;
				if (hangmanChances[room] >= 10) {
					clearInterval(hangmanInterval[room]);
					hangmanON[room] = false;
					this.say(config.nick, room, 'RIP, the man has died. Game over.');
					this.say(config.nick, room, 'The answer was ' + hangmanA[room] + '.');
					hangmanA[room] = '';
					if (!hangmanDes[room]) return false;
					if (hangmanDes[room].indexOf('http') > -1) {
						this.say(config.nick, room, 'For a tutorial/information about this dance style/term, click this following link: ' + hangmanDes[room])
					}
					else {
						this.say(config.nick, room, 'The definition of this word is: ' + hangmanDes[room])
					}
				}
			}
		}
		else {
			if (hangmanA[room].indexOf(toId(arg)) > -1) {
				for (var i = 0; i < hangmanA[room].length; i++) {
					if (hangmanA[room].charAt(i) === toId(arg)) {
						hangmanProgress[room] = hangmanProgress[room].slice(0, 2 * i) + toId(arg) + hangmanProgress[room].slice((2 * i) + 1, hangmanProgress[room].length);
					}
					if (!(hangmanProgress[room].indexOf('_') > -1)) {
						this.say(config.nick, room, '' + by + ' has gotten all of the letters. Congrats on completing the word!');
						clearInterval(hangmanInterval[room]);
						hangmanON[room] = false;
						hangmanA[room] = '';
						if (!hangmanDes[room]) return false;
						if (hangmanDes[room].indexOf('http') > -1) {
							this.say(config.nick, room, 'For a tutorial/information about this dance style/term, click this following link: ' + hangmanDes[room])
						}
						else {
							this.say(config.nick, room, 'The definition of this word is: ' + hangmanDes[room])
						}
					}
				}
			}
			else {
				hangmanProgress[room] += toId(arg) + ' ';
				hangmanChances[room]++;
				if (hangmanChances[room] >= 10) {
					clearInterval(hangmanInterval[room]);
					hangmanON[room] = false;
					this.say(config.nick, room, 'RIP, the man has died. Game over.');
					this.say(config.nick, room, 'The answer was ' + hangmanA[room] + '.');
					hangmanA[room] = '';

					if (!hangmanDes[room]) return false;
					if (hangmanDes[room].indexOf('http') > -1) {
						this.say(config.nick, room, 'For a tutorial/information about this dance style/term, click this following link: ' + hangmanDes[room])
					}
					else {
						this.say(config.nick, room, 'The definition of this word is: ' + hangmanDes[room])
					}
				}
			}
		}
	},
	anagram: 'anagrams',
	anagrams: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('anagrams', room, by)) return false;
		if (anagramON[room]) return false;
		anagramON[room] = true;
		anagramA[room] = '';
		anagramPoints[room] = [];
		this.say(by, room, 'Hosting a game of anagrams. Use ' + config.commandcharacter[0] + 'guess to submit your answer.');
		game('anagrams', room)
		anagramInterval[room] = setInterval(function() {
			if (anagramA[room]) {
				this.say(config.nick, room, 'The correct answer was: ' + anagramA[room]);
			}
			var AQN = Math.floor(hangmanWords.length * Math.random());
			var AnagramEntry = hangmanWords[AQN].split('||');
			anagramA[room] = AnagramEntry[0];
			var anagramQ = anagramA[room];
			var repeatTimes = (anagramA[room].length + 2) * (anagramA[room].length + 2);
			for (var idx = 0; idx < repeatTimes; idx++) {
				var randomInt = Math.floor(Math.random() * anagramA[room].length + 1);
				anagramQ = anagramQ.slice(1, randomInt) + anagramQ.charAt(0) + anagramQ.slice(randomInt, anagramQ.length);
			}
			var text = anagramQ[0];
			for (var i = 1; i < anagramQ.length; i++) {
				text += ', ' + anagramQ[i];
			}
			this.talk(room, '[Pokemon] ' + text);
		}.bind(this), 17000);
	},
	guess: function(arg, by, room) {
		if (!anagramON[room]) return false;
		if (!toId(arg)) return false;
		if (toId(arg) !== toId(anagramA[room])) return false;
		var user = toId(by);
		if (anagramPoints[room].indexOf(user) > -1) {
			anagramA[room] = '';
			anagramPoints[room][anagramPoints[room].indexOf(user) + 1] = anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + 1;
			if (anagramPoints[room][anagramPoints[room].indexOf(user) + 1] >= 10) {
				clearInterval(anagramInterval[room]);
				this.say(config.nick, room, 'Congrats to ' + by + ' for winning!');
				anagramON[room] = false;
				return false;
			}
			this.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + ' points!');
		}
		else {
			anagramA[room] = '';
			anagramPoints[room][anagramPoints[room].length] = user;
			anagramPoints[room][anagramPoints[room].length] = 1;
			this.say(config.nick, room, '' + by.slice(1, by.length) + ' got the right answer, and has ' + anagramPoints[room][anagramPoints[room].indexOf(user) + 1] + ' point!');
		}
	},
	endanagram: 'endanagrams',
	endanagrams: function(arg, by, room) {
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('anagrams', room, by)) return false;
		clearInterval(anagramInterval[room]);
		if (!anagramON[room]) return false;
		anagramON[room] = false;
		this.say(by, room, 'The game of anagrams has been ended.')
	},
	anagrampoints: function(arg, by, room) {
		if (!anagramON[room]) return false;
		if (room.charAt(',') === 0) return false;
		if (!this.canUse('anagrams', room, by)) return false;
		var text = 'Points so far: '
		for (var i = 0; i < anagramPoints[room].length; i++) {
			text += '' + anagramPoints[room][i] + ': ';
			text += anagramPoints[room][i + 1] + ' points, ';
			i++
		}
		this.say(by, room, text);
	},
	editcom: function(arg, by, room) {
		if (!this.canUse('addcom', room, by) || !arg || arg.split(',').length < 2) return false;
		var command = toId(arg.split(',')[0]);
		var output = arg.split(',').slice(1).join(',').trim();
		if(!output || output.length === 0) return false;
		var search = config.serverid + '|' + toId(config.nick) + '|' + room + '|' + command + '|';
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
		for (var i = 0; i < ccommands.length; i++) {
			if(ccommands[i].indexOf(search) === 0){
				var spl = ccommands[i].split('|');
				var part = spl.slice(0, 5).join('|');
				ccommands[i] = part + '|' + output + '|' + by;
				fs.writeFileSync('data/addcom.txt', ccommands.join('\n'));
				return this.say(by, room, 'Command edited!');
			}
		}
		this.say(by, room, 'I was unable to find the command!');
	},
	setcom: function(arg, by, room) {
		if (!this.canUse('addcom', room, by) || !arg) return false;
		var command = toId(arg.split(',')[0]);
		var tarRanks = 'n+★%@#&~';
		var newRank = arg.split(',')[1];
		if(newRank){
			newRank = newRank.trim();
		}
		if (newRank && (tarRanks.indexOf(newRank) === -1 || newRank.length !== 1)) return this.say(by, room, 'The format is ' + config.commandcharacter[0] + 'setcom [command], [rank]')
		var search = config.serverid + '|' + toId(config.nick) + '|' + room + '|' + command + '|';
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");
		for (var i = 0; i < ccommands.length; i++) {
			if (ccommands[i].indexOf(search) === 0) {
				var spl = ccommands[i].split('|');
				if (!newRank) {
					return this.say(by, room, config.commandcharacter[0] + command + ' is usable by users ' + spl[4].replace('n', '"reg"') + ' and higher')
				}
				var part = spl.slice(0, 4).join('|');
				ccommands[i] = part + '|' + newRank + '|' + spl.slice(5).join('|');
				fs.writeFileSync('data/addcom.txt', ccommands.join('\n'));
				return this.say(by, room, 'Command "' + command + '" is set at rank ' + newRank + '.');
			}
		}
		this.say(by, room, 'I was unable to find the command!');
	},
	addcom: function(arg, by, room) {
		if (!this.canUse('addcom', room, by)) return false;
		var splarg = arg.split(',');
		var tarRanks = 'n+★%@#&~';
		if (!splarg[0] || !splarg[1] || !splarg[2]) {
			this.say(by, room, 'The correct format is +addcom __command__, __rank__, __output__');
			return false;
		}

		splarg[0] = toId(splarg[0]);
		splarg[1] = splarg[1].trim();

		if (!splarg[0] || !splarg[1] || !splarg[2]) {
			this.say(by, room, 'The correct format is +addcom __command__, __rank__, __output__');
			return false;
		}
		if (!(tarRanks.indexOf(splarg[1]) > -1) || splarg[1].length !== 1) {
			splarg[1] = config.defaultrank;
		}
		if (Commands[splarg[0]]) {
			this.say(by, room, 'Such a command already exists naturally on the bot.');
			return false;
		}
		var ccommands = fs.readFileSync('data/addcom.txt').toString().split("\n");

		for (var idx = 0; idx < ccommands.length; idx++) {
			var comspl = ccommands[idx].split('|');
			if (room === comspl[2] && splarg[0] === comspl[3] && comspl[0] === config.serverid && comspl[1] === toId(config.nick)) {
				return this.say(by, room, 'This custom command already exists! To change it, use ' + config.commandcharacter[0] + 'editcom [command], [output]');
			}
		}
		fs.appendFile('data/addcom.txt', config.serverid + '|' + toId(config.nick) + '|' + room + '|' + splarg[0] + '|' + splarg[1] + '|' + splarg.slice(2).join(',') + '|' + by + '\n');
		this.say(by, room, 'The custom command "' + splarg[0] + '" has successfully been entered!!!');
	},
	delcom: 'deletecom',
	deletecom: function(arg, by, room) {
		if (!this.canUse('addcom', room, by) || !arg) return false;

		var success = false;
		var bannedwords = fs.readFileSync('data/addcom.txt').toString().split('\n');
		var temp = fs.readFileSync('data/addcom.txt').toString();

		for (var i = 0; i < bannedwords.length; i++) {
			var spl = bannedwords[i].toString().split('|');
			if (arg == spl[3] && spl[2] == room && spl[1] === toId(config.nick) && spl[0] === config.serverid) {
				var search = spl.join('|');
				var idx = temp.indexOf(search);
				if (idx >= 0) {
					var output = temp.substr(0, idx) + temp.substr(idx + search.length);
					output = output.replace(/^\s*$[\n\r]{1,}/gm, '');
					fs.writeFileSync('data/addcom.txt', output);
					this.say(by, room, 'The command "' + arg + '" has been removed from the room ' + room);
					success = true;
				}
			}
		}
		if (success == false) this.say(by, room, 'The command does not exist');
	},
	comlist: function(arg, by, room) {
		if (!this.canUse('addcom', room, by)) return false;

		if (this.rankFrom(by, '@') && arg) {
			room = toId(arg);
			var allowInfo = true;
		}
		//allow more information?

		var comlist = fs.readFileSync('data/addcom.txt').toString().split('\n')
		var tarComlist = '';
		var success = false;
		for (var i = 0; i < comlist.length; i++) {
			var spl = comlist[i].split('|');
			if (room === spl[2] && toId(config.nick) === spl[1] && config.serverid === spl[0]) {
				tarComlist += spl[3] + ': For rank ' + spl[4] + ' and above. Output: ' + spl.slice(5, spl.length - 1).join('|') + (allowInfo ? '\nMade by: ' + spl[spl.length - 1] : '') + '\n\n';
				success = true;
			}
		}
		if (!success) {
			return this.say(by, (this.rankFrom(by, '@') && arg ? ',' + by : room), 'No custom commands for this room yet. ;-;');
		}
		else {
			this.uploadToHastebin(tarComlist, function(link) {
				if (this.rankFrom(by, '@') && arg) {
					return this.say(by, '', (room.charAt(0) === ',' ? '' : '/w ' + by + ', ') + 'Custom Command list for room ' + this.rooms[room].name + ": " + link);
				}
				this.say(by, room, 'Custom Command list for room ' + this.rooms[room].name + ": " + link);
			}.bind(this));
		}
	},
	tell: 'mail',
	mail: function(arg, by, room) {
		var mailbl = fs.readFileSync('data/mailbl.txt').toString().split('\n');
		var spl = arg.split(', ');
		if (!spl[0] || !spl[1]) return this.say(by, ',' + by, 'The correct format is +mail [user], [msg]');
		var destination = toId(spl[0]);
		if (mailbl.indexOf(toId(by)) > -1 && destination !== toId(by)) return this.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'Swish, mail has been sent to ' + destination + '!');
		spl = spl.slice(1).join(', ');
		fs.appendFile('data/mail.txt', destination + '|' + spl + ' - ' + by + '\n', function() {
			this.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'Swish, mail has been sent to ' + destination + '!');
		}.bind(this));
		var d = new Date();
		if (mailbl.indexOf(toId(by)) > -1) return false;
		fs.appendFile('data/maillog.txt', destination + '|' + spl + ' - ' + toId(by) + '~' + d + '\n', function(err) {});
	},
	banmail: 'mailban',
	mailban: function(arg, by, room) {
		if (!this.rankFrom(by, '@')) return false;
		if (!this.outrank(by, arg)) return false;
		if (room.charAt(0) !== ',') return false;
		arg = toId(arg);
		fs.appendFile('data/mailbl.txt', arg + '\n', function() {
			this.say(by, room, arg + ' is now banned from using ' + config.commandcharacter[0] + 'mail');
		}.bind(this));
		this.botlog('global', arg + ' was banned from using mail by ' + by);
	},
	maillog: 'maillogs',
	maillogs: function(arg, by, room) {
		if (room.charAt(0) !== ',') return false;
		if (!this.rankFrom(by, '@')) return false;
		var maillogs = fs.readFileSync('data/maillog.txt').toString().split('\n');
		var data = '';
		for (var i = 0; i < maillogs.length; i++) {
			if (!maillogs[i]) {
				continue;
			}
			var splmsg = maillogs[i].split('|');
			var spluser = maillogs[i].split(' - ');
			var spldate = maillogs[i].split('~')
			var date = spldate[spldate.length - 1];
			var iddx = spluser[spluser.length - 1].indexOf('~' + date);
			var sender = spluser[spluser.length - 1].slice(0, iddx);
			var tarGet = splmsg[0];
			splmsg = splmsg.slice(1).join('|');
			var idx = splmsg.indexOf(' - ' + sender + '~');
			var temp = splmsg.slice(0, idx);
			if (toId(arg) && toId(arg) !== 'all') {
				if (toId(sender) === toId(arg)) {
					data += '[' + date + ']  ' + sender + ' (private to ' + tarGet + '): ' + temp + '\n\n';
				}
				continue;
			}
			data += '[' + date + ']  ' + sender + ' (private to ' + tarGet + '): ' + temp + '\n\n';
		}
		if (!data) return this.say(by, room, 'Sorry, no logs found.')
		this.uploadToHastebin(data, function(link) {
			this.say(by, room, 'Logs of .mail: ' + link);
		}.bind(this));
	},
	checkmail: function(arg, by, room) {
		if (!this.checkMail(by, room)) return this.say(by, room, (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ') + 'You have no mail ;-;');
		if (room.charAt !== ',') {
			room = ',' + toId(by);
		}
		this.mailUser(by, room);
	},
	aq: 'addquote',
	qa: 'addquote',
	addquote: function(arg, by, room) {
		if (!this.canUse('addquote', room, by)) return false;
		if (!arg) return false;
		var quoteList = fs.readFileSync('data/quotes.txt').toString().split('\n');
		var search = room + '|' + arg;
		if (quoteList.indexOf(search) > -1) return this.say(by, room, 'This quote already exists!');
		fs.appendFile('data/quotes.txt', search + '\n');
		this.say(by, room, 'The quote has been added.');
	},
	q: 'quote',
	quote: function(arg, by, room) {
		if (!this.canUse('quote', room, by)) return false;
		var text = this.loadQuotes(room);
		if (!text) return this.say(by, room, 'No quotes for this room yet.');
		if (arg) {
			arg = arg.replace(/[^0-9]/g, '');
		}
		if (arg) {
			arg = arg * 1 - 1;
			if (arg > text.length - 1) {
				arg = Math.floor(Math.random() * text.length);
			}
			if (arg < 0) {
				arg = Math.floor(Math.random() * text.length);
			}
			this.say(by, room, stripCommands(text[arg]), true);
		}
		else {
			var mathRand = Math.floor(Math.random() * text.length);
			this.say(by, room, stripCommands(text[mathRand]), true);
		}
	},
	qlist: 'quotelist',
	quotelist: function(arg, by, room) {
		if (!this.canUse('addquote', room, by)) return false;
		if (this.rankFrom(by, '@') && arg) {
			room = toId(arg);
		}
		var text = this.loadQuotes(room);
		if (!text) return this.say(by, room, 'No quotes saved yet.');
		var output = '';
		for (var i = 0; i < text.length; i++) {
			var quoteId = i + 1
			output += quoteId + ': ' + text[i] + '\n\n';
		}
		this.uploadToHastebin(output, function(link) {
			if (this.rankFrom(by, '@') && arg) {
				return this.say(by, '', (room.charAt(0) === ',' ? '' : '/w ' + by + ', ') + 'Quotes: ' + link);
			}
			this.say(by, room, 'Quotes: ' + link);
		}.bind(this));

	},
	qd: 'deletequote',
	delq: 'deletequote',
	dquote: 'deletequote',
	delquote: 'deletequote',
	deletequote: function(arg, by, room) {
		if (!this.canUse('addquote', room, by)) return false;
		var updateQuote = fs.readFileSync('data/quotes.txt').toString();
		var search = room + '|' + arg + '\n';
		var idx = updateQuote.indexOf(search)
		if (idx > -1) {
			updateQuote = updateQuote.substr(0, idx) + updateQuote.substr(idx + search.length);
			fs.writeFileSync('data/quotes.txt', updateQuote);
			return this.say(by, room, 'Deleted.');
		}
		this.say(by, room, 'We couldn\'t seem to find such a quote...');
	},
	banroom: function(arg, by, room) {
		if (!this.rankFrom(by, '~')) return false;
		fs.appendFile('data/bannedrooms.txt', '\n' + toId(arg));
		this.botlog('global', arg + ' room was banned from using the bot by ' + by);
		this.say(by, room, 'RIP ' + arg);
	},
	addpoke: 'addpokemon',
	addpokemon: function(arg, by, room) {
		if (!this.isDev(by)) return false;
		arg = arg.replace(/, /g, ',').split(',');
		if (!arg[0] || !arg[1] || !arg[2]) {
			return this.say(by, room, 'Missing information (pokemon, role, typings)');
		}
		if (toId(arg[1]) !== 'physicalattacker' && toId(arg[1]) !== 'specialattacker' && toId(arg[1]) !== 'physicalwall' && toId(arg[1]) !== 'specialwall' && toId(arg[1]) !== 'mega' && toId(arg[1]) !== 'revengekiller' && toId(arg[1]) !== 'utility') {
			return this.say(by, room, 'Invalid pokemon role. (pokemon, role, typings)')
		}

		var typeOrder = ['normal', 'electric', 'fire', 'water', 'grass', 'ice', 'psychic', 'dark', 'fighting', 'ghost', 'bug', 'fairy', 'poison', 'dragon', 'ground', 'rock', 'steel', 'flying']
		var typeList = fs.readFileSync('data/typelist.txt').toString().split('\n');

		if (arg[2]) {
			var typeindex = typeOrder.indexOf(toId(arg[2]));
			if (typeindex === -1) {
				return this.say(by, room, 'Invalid type');
			}
			var weaknesses = typeList[typeindex].split('|')
			weaknesses = weaknesses.slice(1);
		}

		if (arg[3]) {
			if (toId(arg[3])) {
				var typeindex = typeOrder.indexOf(toId(arg[3]));
				if (typeindex === -1) {
					return this.say(by, room, 'Invalid type');
				}
				var tarweaknesses = typeList[typeindex].split('|')
				tarweaknesses = tarweaknesses.slice(1);

				for (var i = 0; i < tarweaknesses.length; i++) {
					weaknesses[i] = tarweaknesses[i] * weaknesses[i];
				}
			}
		}
		var text = toId(arg[0]) + '|' + toId(arg[1]) + '|' + weaknesses.join('|');
		fs.appendFile('data/pokemontyping.txt', text + '\n');
		this.say(by, room, 'Added!');
	},
	repeatperms: function(arg, by, room) {
		if (!this.rankFrom(by, '~')) return false;
		fs.appendFile('data/repeatperms.txt', '\n' + toId(arg));
		this.say(by, room, 'Added!')
		this.botlog('global', arg + ' was given perms to use repeat by ' + by);
	},
	botban: function(arg, by, room) {
		if (!this.rankFrom(by, '@')) return false;
		if (!this.outrank(by, arg)) return false;
		var banned = fs.readFileSync('data/commandban.txt').toString().split('\n');
		if (banned.indexOf(toId(arg)) > -1) return this.say(by, room, 'User is already banned.')
		fs.appendFile('data/commandban.txt', toId(arg) + '\n');
		this.say(by, room, arg + ' was banned from using the bot by ' + by)
		this.botlog('global', arg + ' was banned from using the bot by ' + by);
		Commands.bot.call(this, 'deauth, ' + arg, config.nick, room);
	},
	botunban: function(arg, by, room) {
		if (!this.rankFrom(by, '@')) return false;
		if (!this.outrank(by, arg)) return false;
		var banned = fs.readFileSync('data/commandban.txt').toString();
		arg = toId(arg);
		var success = false;
		var search = '\n' + arg + '\n';

		var idx = banned.indexOf(search);
		banned = banned.replace(new RegExp(search, "g"), '\n');
		fs.writeFileSync('data/commandban.txt', banned);
		if (idx === -1) {
			return this.say(by, room, 'User not found.')
		}
		else {
			this.say(by, room, 'Done.')
		}
		this.botlog('global', arg + ' was unbanned from using the bot by ' + by);

	},
	newentry: 'addentry',
	reminder: 'addentry',
	addentry: function(arg, by, room) {
		if (!this.canUse('addentry', room, by)) return false;
		if (!arg) return false;
		var quoteList = fs.readFileSync('data/entries.txt').toString().split('\n');
		var search = room + '|' + arg;
		if (quoteList.indexOf(search) > -1) return this.say(by, room, 'This entry already exists!');
		fs.appendFile('data/entries.txt', search + '\n');
		this.say(by, room, 'The entry has been added.');
	},
	e: 'entry',
	entry: function(arg, by, room) {
		if (!this.canUse('entry', room, by)) return false;
		var text = this.loadEntries(room);
		if (!text) return this.say(by, room, 'No entries for this room yet.');
		if (arg) {
			arg = arg.replace(/[^0-9]/g, '');
		}
		if (arg) {
			arg = arg * 1 - 1;
			if (arg > text.length - 1) {
				return this.say(by, room, 'That entry doesn\'t exist..');
			}
			if (arg < 0) {
				return this.say(by, room, 'That entry doesn\'t exist..');
			}
			this.say(by, room, text[arg])
		}
		else {
			var mathRand = Math.floor(Math.random() * text.length);
			this.say(by, room, text[mathRand]);
		}
	},

	journal: 'todolist',
	todolist: function(arg, by, room) {
		if (!this.canUse('entry', room, by)) return false;
		var text = this.loadEntries(room);
		if (!text) return this.say(by, room, 'No entries saved yet.');
		var output = '';
		for (var i = 0; i < text.length; i++) {
			var quoteId = i + 1
			output += quoteId + ': ' + text[i] + '\n\n';
		}
		this.uploadToHastebin(output, function(link) {
			this.say(by, room, 'List: ' + link);
		}.bind(this));

	},
	delentry: 'complete',
	finish: 'complete',
	complete: function(arg, by, room) {
		if (!this.canUse('addentry', room, by)) return false;

		var updateQuote = fs.readFileSync('data/entries.txt').toString();
		var search = room + '|' + arg + '\n';
		var idx = updateQuote.indexOf(search)
		if (idx > -1) {
			updateQuote = updateQuote.substr(0, idx) + updateQuote.substr(idx + search.length);
			fs.writeFileSync('data/entries.txt', updateQuote);
			return this.say(by, room, 'Deleted.');
		}
		this.say(by, room, 'We couldn\'t seem to find such an entry...');
	},
	wm: 'welcome',
	joinmsg: 'welcome',
	message: 'welcome',
	welcomemessage: 'welcome',
	welcome: function(arg, by, room) {
		if (!fs.existsSync('data/wcmsg.txt') || !fs.existsSync('data/ignorewcmsg.txt')) {
			return this.say(by, room, 'Looks like someone forgot to make the files needed for this command.....')
		}
		arg = arg.replace(/, /g, ',').split(',');
		var data = fs.readFileSync('data/wcmsg.txt').toString().split('\n');
		var ignore = fs.readFileSync('data/ignorewcmsg.txt').toString().split('\n');
		switch (arg[0]) {
			case 'set':
				if (!this.hasRank(by, '#&~')) return false;
				if (!arg[1]) return this.say(by, room, 'You forgot to include a message.');
				if (data.indexOf(room + '|' + config.serverid) > -1) {
					data[data.indexOf(room + '|' + config.serverid) + 1] = 'n|' + stripCommands(arg.slice(1).join(', '));
				}
				else {
					data[data.length] = room + '|' + config.serverid;
					data[data.length] = 'n|' + stripCommands(arg.slice(1).join(', '));
				}
				this.say(by, room, 'The welcome message was set.');
				fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
				this.botlog(room, by + ' has set the welcome message in ' + room + ' to: \"' + stripCommands(arg.slice(1).join(', ')) + '\"');
				break;
			case 'on':
				if (!this.hasRank(by, '#&~')) return false;
				if (data.indexOf(room + '|' + config.serverid) > -1) {
					data[data.indexOf(room + '|' + config.serverid) + 1] = 'n' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(1);
				}
				else {
					return this.say(by, room, 'You need to set a welcome message first')
				}
				this.say(by, room, 'The welcome message was enabled.');
				fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
				break;
			case 'off':
				if (!this.hasRank(by, '#&~')) return false;
				if (data.indexOf(room + '|' + config.serverid) > -1) {
					data[data.indexOf(room + '|' + config.serverid) + 1] = 'd' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(1);
				}
				else {
					return this.say(by, room, 'You need to set a welcome message first')
				}
				this.say(by, room, 'The welcome message was disabled.');
				fs.writeFileSync('data/wcmsg.txt', data.join('\n'));
				break;
			case 'ignore':
				if (room.charAt(0) !== ',') return false;
				if (ignore.indexOf(toId(by)) > -1) return this.say(by, room, 'You are already ignoring welcome messages!~');
				fs.appendFile('data/ignorewcmsg.txt', '\n' + toId(by));
				this.say(by, room, 'You are now ignoring welcome messages.')
				break;
			case 'unignore':
				if (room.charAt(0) !== ',') return false;
				if (ignore.indexOf(toId(by)) === -1) return this.say(by, room, 'You are already recieving welcome messages!~');
				var ignoredata = fs.readFileSync('data/ignorewcmsg.txt').toString();
				var replacer = '\n' + toId(by)
				fs.writeFileSync('data/ignorewcmsg.txt', ignoredata.replace(new RegExp(replacer, "g"), ''));
				this.say(by, room, 'You are now recieving welcome messages.')
				break;
			case 'show':
				if (!this.hasRank(by, '#&~')) return false;
				if (data.indexOf(room + '|' + config.serverid) === -1) return false;
				this.say(by, room, '\"' + data[data.indexOf(room + '|' + config.serverid) + 1].slice(2) + '\"');
		}
	},
	randpoke: function(arg, by, room) {
		if (!this.hasRank(by, '&~')) return this.say(by, room, "You're not salty enough. Sorry. :^(");
		var ranges = [
			['1', '151'],
			['152', '251'],
			['252', '386'],
			['387', '493'],
			['494', '649'],
			['650', '721']
		];
		var gens = ['gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
		if (gens.indexOf(toId(arg)) === -1 && arg) return false;
		this.say(by, room, "!data " + (arg ? ranges[gens.indexOf(toId(arg))][0] * 1 + ~~((ranges[gens.indexOf(toId(arg))][1] - ranges[gens.indexOf(toId(arg))][0]) * Math.random()) + 1 : ~~(Math.random() * 721)));
	},
	botlog: function(arg, by, room) {
		if (!this.rankFrom(by, '@')) return false;
		room = ',' + by;
		arg = arg.replace(', ', ',').split(',');

		var botLogs = fs.readFileSync('data/botlog.txt').toString().split('\n');

		var text = ''

		for (var i = 0; botLogs.length > i; i++) {
			for (var j = 0; j < arg.length; j++) {
				var addText = false
				if (botLogs[i].indexOf(arg[j].trim()) === -1) {
					addText = false
					continue;
				}
				if (addText) {
					text += botLogs[i] + '\n\n';
				}
			}
		}
		this.uploadToHastebin(text, function(link) {
			this.say(by, room, 'List: ' + link);
		}.bind(this));
	},

	bot: function(arg, by, room) {
		arg = arg.replace(/, /g, ',').split(',');
		if (!arg[1] && arg[0] !== 'auth' && arg[0] !== 'help') {
			return false;
		}
		if (arg[1]) {
			var target = toId(arg[1]);
		}
		var action = arg[0];
		switch (action) {
			case 'voice':
				if (!this.rankFrom(by, '@') || this.botRank(target) === '+' || !this.outrank(by, target)) return false;
				if (this.botRank(target) === ' ') {
					fs.appendFile('data/ranks.txt', '+' + target + '\n');
				}
				else {
					var ranks = fs.readFileSync('data/ranks.txt').toString();
					ranks = ranks.replace(this.botRank(target) + target + '\n', '+' + target + '\n')
					fs.writeFileSync('data/ranks.txt', ranks);
				}
				this.say(by, room, target + ' was appointed BotVoice by ' + by);
				this.botlog('global', target + ' was appointed BotVoice by ' + by);
				break;
			case 'deauth':
				if (!this.outrank(by, target) || this.botRank(target) === ' ') return false;
				var ranks = fs.readFileSync('data/ranks.txt').toString();
				ranks = ranks.replace(this.botRank(target) + target + '\n', '');
				fs.writeFileSync('data/ranks.txt', ranks);
				this.say(by, room, '(' + target + ' no longer has BotAuth.)');
				this.botlog('global', '(' + target + ' no longer has BotAuth by ' + by + ')');
				break;
			case 'mod':
				if (!this.rankFrom(by, '~') || this.botRank(target) === '@') return false;
				if (this.botRank(target) === ' ') {
					fs.appendFile('data/ranks.txt', '@' + target + '\n');
				}
				else {
					var ranks = fs.readFileSync('data/ranks.txt').toString();
					ranks = ranks.replace(this.botRank(target) + target + '\n', '@' + target + '\n');
					fs.writeFileSync('data/ranks.txt', ranks);
				}
				this.say(by, room, target + ' was appointed BotMod by ' + by);
				this.botlog('global', target + ' was appointed BotMod by ' + by);
				break;
			case 'admin':
				if (!this.rankFrom(by, '~') || this.botRank(target) === '~') return false;
				if (this.botRank(target) === ' ') {
					fs.appendFile('data/ranks.txt', '~' + target + '\n');
				}
				else {
					var ranks = fs.readFileSync('data/ranks.txt').toString();
					ranks = ranks.replace(this.botRank(target) + target + '\n', '~' + target + '\n');
					fs.writeFileSync('data/ranks.txt', ranks);
				}
				this.say(by, room, target + ' was appointed BotAdmin by ' + by);
				this.botlog('global', target + ' was appointed BotAdmin by ' + by);
				break;
			case 'auth':
				var ranks = fs.readFileSync('data/ranks.txt').toString().split('\n');
				var voice = [];
				var mod = [];
				var admin = [];
				for (var i = 0; i < ranks.length; i++) {
					if (!ranks[i]) {
						continue;
					}
					switch (ranks[i].charAt(0)) {
						case '~':
							admin[admin.length] = ranks[i].slice(1);
							break;
						case '@':
							mod[mod.length] = ranks[i].slice(1);
							break;
						case '+':
							voice[voice.length] = ranks[i].slice(1);
							break;
					}
				}
				var text = '~Administrators (' + admin.length + '):\n' + admin.join(', ') + '\n\n@Moderators (' + mod.length + '):\n' + mod.join(', ') + '\n\n+Voices (' + voice.length + '):\n' + voice.join(', ');
				this.uploadToHastebin(text, function(link) {
					this.say(by, (this.rankFrom(by, '+') ? room : ',' + by), 'BotAuth: ' + link);
				}.bind(this));
				break;
			default:
				if (!this.rankFrom(by, '@')) return false;
				this.say(by, ',' + by, 'The possible commands are +bot [voice/mod/admin/deauth].');

		}
	},
	bj: 'blackjack',
	blowjob: 'blackjack',
	blackjack: function(arg, by, room) {
		if (room.charAt(0) === ',') return false;
		if (!arg) return this.say(by, (this.hasRank(by, '%@#&~') ? room : ',' + by), 'The params are: new, start, join, end, leave.');
		arg = toId(arg);
		if (!gameStatus[room]) {
			gameStatus[room] = 'off';
		}
		switch (arg) {
			case 'new':
				if (!this.canUse('blackjack', room, by)) return false;
				if (gameStatus[room] !== 'off') return this.say(by, room, 'A game is already going on!');
				this.say(by, room, 'A new game of blackjack is starting. do +bj join to join the game!')
				game('blackjack', room);
				clearInterval(blackJack[room]);
				gameStatus[room] = 'signup';
				playerCount[room] = [];
				playerData[room] = {};
				currentPlayer[room] = '';
				break;
			case 'join':
				if (gameStatus[room] !== 'signup') return false;
				if (playerData[room][toId(by)]) {
					return this.say(by, ',' + by, 'You\'ve already signed up!');
				}
				else {
					this.say(by, ',' + by, 'Thank you for signing up!')
					playerData[room][toId(by)] = {
						name: by.slice(1),
						hand: [],
						total: 0,
					}
					playerCount[room][playerCount[room].length] = toId(by);
				}
				break;
			case 'leave':
				if (gameStatus[room] !== 'signup') return false;
				if (playerData[room][toId(by)]) {
					playerData[room][toId(by)] = {};
					//re-make playerlist
					var pIndex = playerCount[room].indexOf(toId(by));
					var pushPlayer = [];
					for (var x = 0; x < playerCount[room].length; x++) {
						if (x === pIndex) {
							continue;
						}
						pushPlayer.push(playerCount[room][x]);
					}
					//reset playerlist
					playerCount[room] = pushPlayer;
					this.say(by, ',' + by, 'Aww, next time then!')
				}
				break;
			case 'start':
				if (!this.canUse('blackjack', room, by)) return false;
				if (gameStatus[room] !== 'signup') return false;
				if (!playerCount[room] || playerCount[room].length === 0) return this.say(by, room, 'No one has joined yet ;-;')
				gameStatus[room] = 'on';
				clearInterval(blackJack[room]);
				deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);

				//dealers stuff/
				playerData[room][toId(config.nick)] = {
					name: config.nick,
					hand: [],
					total: 0,
				};

				//determine who goes first
				currentPlayer[room] = playerCount[room][0];
				//deal the cards
				for (var i = 0; i < 2; i++) {
					for (var j = 0; j < playerCount[room].length; j++) {
						//hand out the cards
						var targetPlayer = playerCount[room][j];
						var handSize = playerData[room][targetPlayer].hand.length;
						playerData[room][targetPlayer].hand[handSize] = deck[room][0];
						playerData[room][targetPlayer].total = this.parseHandTotal(playerData[room][targetPlayer].hand);
						deck[room] = deck[room].slice(1);
						if (deck[room].length === 0) {
							deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
						}
						//say top card
						if (i === 0) {
							this.talk(room, 'Top Card - ' + playerData[room][playerCount[room][j]].name + ': [' + playerData[room][playerCount[room][j]].hand[0] + ']')
						}
					}
					//dealers card
					targetPlayer = toId(config.nick);
					var handSize = playerData[room][targetPlayer].hand.length;
					playerData[room][targetPlayer].hand[handSize] = deck[room][0];
					playerData[room][targetPlayer].total = this.parseHandTotal(playerData[room][targetPlayer].hand);
					deck[room] = deck[room].slice(1);
					if (deck[room].length === 0) {
						deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
					}
					//say top card
					if (i === 0) {
						this.talk(room, '**Dealer\'s Top Card: [' + playerData[room][targetPlayer].hand[0] + ']**')
					}

				}

				//old deal
				/*
				playerData[room][currentPlayer[room]].hand = deck[room].slice(0, 2);
				deck[room] = deck[room].slice(2);
				*/
				this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__')
				this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total);
				//start the turns
				blackJack[room] = setInterval(function() {
					if (gameStatus[room] !== 'on') {
						clearInterval(blackJack[room]);
						return false;
					}
					if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
						clearInterval(blackJack[room]);
						//code for summing up, dealer stuff
						this.say(config.nick, room, 'Dealer\'s turn now...');
						//drawing until over 17
						for (var i = 0; i < 17; i++) {
							if (playerData[room][toId(config.nick)].total < 17) {
								var handSize = playerData[room][toId(config.nick)].hand.length;
								playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
								playerData[room][toId(config.nick)].total = this.parseHandTotal(playerData[room][toId(config.nick)].hand);
								deck[room] = deck[room].slice(1);
								if (deck[room].length === 0) {
									deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
								}
							}
							else {
								break;
							}
						}
						//conclusion of winners
						//naturals
						var naturals = [];
						for (var players = 0; players < playerCount[room].length; players++) {
							var tarPlayer = playerCount[room][players]
							if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
								naturals.push(playerData[room][tarPlayer].name);
							}
						}
						var winnerList = []
						if (playerData[room][toId(config.nick)].total > 21) {
							this.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
							for (var players = 0; players < playerCount[room].length; players++) {
								var tarPlayer = playerCount[room][players]
								if (playerData[room][tarPlayer].total < 22) {
									winnerList[winnerList.length] = playerData[room][tarPlayer].name;
								}
							}
						}
						else if (playerData[room][toId(config.nick)].total === 21) {
							gameStatus[room] = 'off';
							this.say(config.nick, room, 'The Dealer has a BlackJack!')
						}
						else {
							this.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
							for (var players = 0; players < playerCount[room].length; players++) {
								var tarPlayer = playerCount[room][players]
								if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
									winnerList[winnerList.length] = playerData[room][tarPlayer].name;
								}
							}
						}
						gameStatus[room] = 'off';
						clearInterval(blackJack[room]);
						if (naturals[0]) {
							this.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', '))
						}
						return this.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') : 'Sorry, no winners this time.'))
					}
					else {
						currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
						this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__')
						this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
					}
				}.bind(this), 90000);
				break;
			case 'end':
				if (!this.canUse('blackjack', room, by)) return false;
				if (gameStatus[room] === 'off') return false;
				clearInterval(blackJack[room]);
				this.say(by, room, 'The game of Blackjack was forcibly ended.')
				gameStatus[room] = 'off';
		}
	},

	hit: function(arg, by, room) {
		if (toId(by) !== currentPlayer[room]) return false;
		if (!gameStatus[room] || gameStatus[room] !== 'on' || room.charAt(0) === ',') return false;
		//deal one more card
		var handSize = playerData[room][currentPlayer[room]].hand.length;
		playerData[room][currentPlayer[room]].hand[handSize] = deck[room][0];
		playerData[room][currentPlayer[room]].total = this.parseHandTotal(playerData[room][currentPlayer[room]].hand);
		deck[room] = deck[room].slice(1);
		if (deck[room].length === 0) {
			deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
		}
		this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)

		if (playerData[room][currentPlayer[room]].total > 21) {
			clearInterval(blackJack[room]);
			this.say(config.nick, room, playerData[room][currentPlayer[room]].name + ' has busted with ' + playerData[room][currentPlayer[room]].total + '!')
			if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
				if (gameStatus[room] !== 'on') {
					clearInterval(blackJack[room]);
					return false;
				}
				clearInterval(blackJack[room]);
				//code for summing up, dealer stuff
				//drawing until over 17
				for (var i = 0; i < 17; i++) {
					if (playerData[room][toId(config.nick)].total < 17) {
						var handSize = playerData[room][toId(config.nick)].hand.length;
						playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
						playerData[room][toId(config.nick)].total = this.parseHandTotal(playerData[room][toId(config.nick)].hand);
						deck[room] = deck[room].slice(1);
						if (deck[room].length === 0) {
							deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
						}
					}
					else {
						break;
					}
				}
				//conclusion of winners
				//naturals
				var naturals = [];
				for (var players = 0; players < playerCount[room].length; players++) {
					var tarPlayer = playerCount[room][players]
					if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
						naturals.push(playerData[room][tarPlayer].name);
					}
				};
				var winnerList = []
				if (playerData[room][toId(config.nick)].total > 21) {
					this.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
					for (var players = 0; players < playerCount[room].length; players++) {
						var tarPlayer = playerCount[room][players]
						if (playerData[room][tarPlayer].total < 22) {
							winnerList[winnerList.length] = playerData[room][tarPlayer].name;
						}
					}
				}
				else if (playerData[room][toId(config.nick)].total === 21) {
					gameStatus[room] = 'off';
					this.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
				}
				else {
					this.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
					for (var players = 0; players < playerCount[room].length; players++) {
						var tarPlayer = playerCount[room][players]
						if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
							winnerList[winnerList.length] = playerData[room][tarPlayer].name;
						}
					}
				}
				gameStatus[room] = 'off';
				if (naturals[0]) {
					this.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', '))
				}
				return this.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') : 'Sorry, no winners this time.'));
				clearInterval(blackJack[room]);
			}
			else {
				currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
				this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
				this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
			}

			blackJack[room] = setInterval(function() {
				if (gameStatus[room] !== 'on') {
					clearInterval(blackJack[room]);
					return false;
				}
				if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
					clearInterval(blackJack[room]);
					//code for summing up, dealer stuff
					this.say(config.nick, room, 'Dealer\'s turn now...');
					//drawing until over 17
					for (var i = 0; i < 17; i++) {
						if (playerData[room][toId(config.nick)].total < 17) {
							var handSize = playerData[room][toId(config.nick)].hand.length;
							playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
							playerData[room][toId(config.nick)].total = this.parseHandTotal(playerData[room][toId(config.nick)].hand);
							deck[room] = deck[room].slice(1);
							if (deck[room].length === 0) {
								deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
							}
						}
						else {
							break;
						}
					}
					//conclusion of winners
					//naturals
					var naturals = [];
					for (var players = 0; players < playerCount[room].length; players++) {
						var tarPlayer = playerCount[room][players]
						if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
							naturals.push(playerData[room][tarPlayer].name);
						}
					};
					var winnerList = []
					if (playerData[room][toId(config.nick)].total > 21) {
						this.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
						for (var players = 0; players < playerCount[room].length; players++) {
							var tarPlayer = playerCount[room][players]
							if (playerData[room][tarPlayer].total < 22) {
								winnerList[winnerList.length] = playerData[room][tarPlayer].name;
							}
						}
					}
					else if (playerData[room][toId(config.nick)].total === 21) {
						gameStatus[room] = 'off';
						this.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
					}

					else {
						this.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
						for (var players = 0; players < playerCount[room].length; players++) {
							var tarPlayer = playerCount[room][players]
							if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
								winnerList[winnerList.length] = playerData[room][tarPlayer].name;
							}
						}
					}
					gameStatus[room] = 'off';
					clearInterval(blackJack[room]);
					if (naturals[0]) {
						this.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', '))
					}
					return this.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') : 'Sorry, no winners this time.'))
				}
				else {
					currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
					this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
					this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
				}
			}.bind(this), 90000);
		}
	},
	stay: function(arg, by, room) {
		if (toId(by) !== currentPlayer[room]) return false;
		if (!gameStatus[room] || gameStatus[room] !== 'on' || room.charAt(0) === ',') return false;

		if (playerData[room][currentPlayer[room]].total === 21) {
			this.say(config.nick, room, playerData[room][currentPlayer[room]].name + ' has a Blackjack!');
		}

		clearInterval(blackJack[room]);

		if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
			if (gameStatus[room] !== 'on') {
				clearInterval(blackJack[room]);
				return false;
			}
			clearInterval(blackJack[room]);
			//code for summing up, dealer stuff
			//drawing until over 17
			for (var i = 0; i < 17; i++) {
				if (playerData[room][toId(config.nick)].total < 17) {
					var handSize = playerData[room][toId(config.nick)].hand.length;
					playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
					playerData[room][toId(config.nick)].total = this.parseHandTotal(playerData[room][toId(config.nick)].hand);
					deck[room] = deck[room].slice(1);
					if (deck[room].length === 0) {
						deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
					}
				}
				else {
					break;
				}
			}
			//conclusion of winners
			//naturals
			var naturals = [];
			for (var players = 0; players < playerCount[room].length; players++) {
				var tarPlayer = playerCount[room][players]
				if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
					naturals.push(playerData[room][tarPlayer].name);
				}
			};
			var winnerList = []
			if (playerData[room][toId(config.nick)].total > 21) {
				this.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
				for (var players = 0; players < playerCount[room].length; players++) {
					var tarPlayer = playerCount[room][players]
					if (playerData[room][tarPlayer].total < 22) {
						winnerList[winnerList.length] = playerData[room][tarPlayer].name;
					}
				}
			}
			else if (playerData[room][toId(config.nick)].total === 21) {
				gameStatus[room] = 'off';
				this.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!')
			}
			else {
				this.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total)
				for (var players = 0; players < playerCount[room].length; players++) {
					var tarPlayer = playerCount[room][players]
					if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
						winnerList[winnerList.length] = playerData[room][tarPlayer].name;
					}
				}
			}
			gameStatus[room] = 'off';
			clearInterval(blackJack[room]);
			if (naturals[0]) {
				this.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', '))
			}
			return this.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') : 'Sorry, no winners this time.'))
		}
		else {
			currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
			this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
			this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
		}


		clearInterval(blackJack[room]);

		blackJack[room] = setInterval(function() {
			if (gameStatus[room] !== 'on') {
				clearInterval(blackJack[room]);
				return false;
			}
			if (!playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1]) {
				clearInterval(blackJack[room]);
				//code for summing up, dealer stuff
				this.say(config.nick, room, 'Dealer\'s turn now...');
				//drawing until over 17

				for (var i = 0; i < 17; i++) {
					if (playerData[room][toId(config.nick)].total < 17) {
						var handSize = playerData[room][toId(config.nick)].hand.length;
						playerData[room][toId(config.nick)].hand[handSize] = deck[room][0];
						playerData[room][toId(config.nick)].total = this.parseHandTotal(playerData[room][toId(config.nick)].hand);
						deck[room] = deck[room].slice(1);
						if (deck[room].length === 0) {
							deck[room] = this.generateDeck(~~(playerCount[room].length / 10) + 1);
						}
					}
					else {
						break;
					}
				}
				//conclusion of winners
				//naturals
				var naturals = [];
				for (var players = 0; players < playerCount[room].length; players++) {
					var tarPlayer = playerCount[room][players]
					if (playerData[room][tarPlayer].total === 21 && playerData[room][tarPlayer].hand.length === 2) {
						naturals.push(playerData[room][tarPlayer].name);
					}
				};
				var winnerList = []
				if (playerData[room][toId(config.nick)].total > 21) {
					this.say(config.nick, room, 'The Dealer has bust with ' + playerData[room][toId(config.nick)].total)
					for (var players = 0; players < playerCount[room].length; players++) {
						var tarPlayer = playerCount[room][players]
						if (playerData[room][tarPlayer].total < 22) {
							winnerList[winnerList.length] = playerData[room][tarPlayer].name;
						}
					}
				}
				else if (playerData[room][toId(config.nick)].total === 21) {
					gameStatus[room] = 'off';

					this.say(config.nick, room, 'The Dealer has a BlackJack! Better luck next time!');
				}
				else {
					this.say(config.nick, room, 'The Dealer has ' + playerData[room][toId(config.nick)].total);
					for (var players = 0; players < playerCount[room].length; players++) {
						var tarPlayer = playerCount[room][players]
						if (playerData[room][tarPlayer].total < 22 && playerData[room][tarPlayer].total > playerData[room][toId(config.nick)].total) {
							winnerList[winnerList.length] = playerData[room][tarPlayer].name;
						}
					}
				}
				gameStatus[room] = 'off';
				if (naturals[0]) {
					this.say(config.nick, room, 'These players have a natural blackjack: ' + naturals.join(', '))
				}
				return this.say(config.nick, room, (winnerList[0] ? 'The winners are: ' + winnerList.join(', ') : 'Sorry, no winners this time.'))
				clearInterval(blackJack[room]);
			}
			else {
				currentPlayer[room] = playerCount[room][playerCount[room].indexOf(currentPlayer[room]) + 1];
				this.say(config.nick, room, playerData[room][currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'hit or ' + config.commandcharacter[0] + 'stay)__');
				this.talk(room, '/w ' + currentPlayer[room] + ', [' + room + '] Your hand is [' + playerData[room][currentPlayer[room]].hand.join('], [') + ']. The total is ' + playerData[room][currentPlayer[room]].total)
			}
		}.bind(this), 90000);
	},
	'c8': 'crazyeights',
	crazyeights: function(arg, by, room) {
		if (room.charAt(0) === ',') return false;
		if (!crazyeight.gameStatus[room]) {
			crazyeight.gameStatus[room] = 'off';
		}
		if (!arg) {
			return false;
		}
		else {
			arg = toId(arg)
		}
		switch (arg) {
			case 'new':
				if (!this.canUse('crazyeights', room, by)) return false;
				if (crazyeight.gameStatus[room] !== 'off') return this.say(by, room, 'A game is already going on!');
				this.say(by, room, 'A new game of Crazy Eights is starting. Do +crazyeights join to join the game!')
				this.say(config.nick, room, 'The goal is to be the first player to get rid of all your cards.  A [ 2] will cause the next player to draw 2 cards and lose their turn.')
				this.say(config.nick, room, 'A [ J] will skip the next player\'s turn and a [♠Q] will make the next player forfeit his/her turn and draw 4 cards. An [ 8] will allow the player to change the suit.');
				this.say(config.nick, room, 'You can play a card with either the same suit or number/letter.  The goal is to get rid of your cards before the other players do so.');
				this.say(config.nick, room, 'You only need to say first letter of the suit + value to play your card. Ex. ' + config.commandcharacter[0] + 'play sQ would be playing the Queen of Spades.')
				game('crazyeights', room);
				crazyeight.gameStatus[room] = 'signups';
				crazyeight.playerData[room] = {};
				crazyeight.playerList[room] = [];
				crazyeight.currentPlayer[room] = '';
				break;
			case 'join':
				if (crazyeight.gameStatus[room] !== 'signups') return false;
				if (crazyeight.playerData[room][toId(by)]) return this.say(by, room, 'You\'ve already signed up!');
				this.say(by, ',' + by, '(' + room + ')  Thank you for joining!');
				crazyeight.playerData[room][toId(by)] = {
					name: by.slice(1),
					hand: [],
					disqualified: false,
				};
				crazyeight.playerList[room][crazyeight.playerList[room].length] = toId(by);
				break;
			case 'leave':
				var pIndex = crazyeight.playerList[room].indexOf(toId(by));
				if (pIndex < 0) return false;
				var pushPlayer = [];
				for (var x = 0; x < crazyeight.playerList[room].length; x++) {
					if (x === pIndex) {
						continue;
					}
					pushPlayer.push(crazyeight.playerList[room][x]);
				}
				//reset playerlist
				crazyeight.playerList[room] = pushPlayer;
				crazyeight.playerData[room][toId(by)] = {};
				break;
			case 'end':
				if (!this.canUse('crazyeights', room, by)) return false;
				if (gameStatus === 'off') return false;
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				this.say(by, room, 'The game was forcibly ended.');
				break;
			case 'start':
				if (!this.canUse('crazyeights', room, by)) return false;
				if (crazyeight.gameStatus[room] !== 'signups') return false;
				if (crazyeight.playerList[room].length < 2) return this.say(by, room, 'There aren\'t enough players ;-;');
				crazyeight.gameStatus[room] = 'on';
				crazyeight.deck[room] = this.generateDeck(1);

				this.say(by, room, 'Use ' + config.commandcharacter[0] + 'play [card] to play a card. c for clubs, h for hearts, s for spades and, d for diamonds. When playing a [ 8], be sure to include what you\'re changing to (' + config.commandcharacter[0] + 'play c8 s)')

				//deal the cards
				for (var j = 0; j < 7; j++) {
					for (var i = 0; i < crazyeight.playerList[room].length; i++) {
						var tarPlayer = crazyeight.playerList[room][i];
						crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
						crazyeight.deck[room] = crazyeight.deck[room].slice(1);
						if (crazyeight.deck[room].length === 0) {
							crazyeight.deck[room] = this.generateDeck(1);
						}
					}
				}

				// Determine/initialize topCard
				crazyeight.topCard[room] = crazyeight.deck[room][0];
				crazyeight.deck[room] = crazyeight.deck[room].slice(1);
				this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
				//new deck if all used up
				if (crazyeight.deck[room].length === 0) {
					crazyeight.deck[room] = this.generateDeck(1);
				}
				//start the turns


				//init first player
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][0];

				this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
				this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__')


				crazyeight.interval[room] = setInterval(function() {
					if (crazyeight.gameStatus[room] !== 'on') {
						clearInterval(crazyeight.interval[room]);
						return false;
					}

					//disqualify for inactivity
					crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
					//re-make playerlist
					var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
					var pushPlayer = [];
					for (var x = 0; x < crazyeight.playerList[room].length; x++) {
						if (x === pIndex) {
							continue;
						}
						pushPlayer.push(crazyeight.playerList[room][x]);
					}
					//reset playerlist
					crazyeight.playerList[room] = pushPlayer;

					//checking if all players are DQ'd

					if (crazyeight.playerList[room].length === 0) {
						this.say(config.nick, room, 'Nobody wins this game :(')
					}
					else if (crazyeight.playerList[room].length === 1) {
						this.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
					}
					if (crazyeight.playerList[room].length < 2) {
						clearInterval(crazyeight.interval[room]);
						crazyeight.gameStatus[room] = 'off';
						return false;
					}
					//change to next player
					crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

					//pming next user their hand
					this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
					this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
					this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
				}.bind(this), 90000)
		}
	},
	play: function(arg, by, room) {
		if (toId(by) !== crazyeight.currentPlayer[room] || !crazyeight.gameStatus[room] || crazyeight.gameStatus[room] !== 'on') return false;
		var suitList = ['♥', '♣', '♦', '♠'];
		var valueList = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		arg = arg.split(' ');

		if (arg[1]) {
			var modifier = arg[1].slice(0, 1).toLowerCase().replace('c', '♣').replace('h', '♥').replace('d', '♦').replace('s', '♠');
		}
		else {
			var modifier = '';
		}


		var suit = arg[0].slice(0, 1).toLowerCase().replace('c', '♣').replace('h', '♥').replace('d', '♦').replace('s', '♠');
		var value = arg[0].slice(1).toUpperCase();
		if (suitList.indexOf(suit) === -1 || valueList.indexOf(value) === -1) return this.say(by, ',' + by, 'To play a card use the first letter of the card\'s suit + the value of the card. (ex. ' + config.commandcharacter[0] + 'play cK would be [♣K])');
		var card = suit + value;

		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.indexOf(card) === -1) {
			return this.say(by, room, 'You don\'t have this card!');
		}
		if (crazyeight.topCard[room].slice(1) !== value && crazyeight.topCard[room][0] !== suit && value !== '8') {
			return this.say(by, room, 'You can\'t play this card now.');
		}
		if (value === '8' && !modifier) {
			return this.say(by, room, 'Please choose what suit to change to.  Ex. ' + config.commandcharacter[0] + 'play c8 s')
		}
		if (modifier) {
			if (suitList.indexOf(modifier) === -1) {
				return this.say(by, room, 'Not a correct suit.')
			}
		}

		clearInterval(crazyeight.interval[room]);

		//new top card
		crazyeight.topCard[room] = card;
		this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		//remove card from hand
		//determine position of the one card
		var idx = crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.indexOf(card);
		var newHand = [];
		for (var i = 0; i < crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length; i++) {
			if (i === idx) {
				continue;
			}
			newHand.push(crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand[i]);
		}
		crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand = newHand;
		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length === 1) {
			this.say(config.nick, room, 'Last Card!');
		}
		//special effects;
		switch (value) {
			case '8':
				crazyeight.topCard[room] = modifier + value;
				this.talk(room, 'Suit is changed to: ' + modifier);
				break;
			case '2':
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
				//for loop - draw 2
				var tarPlayer = crazyeight.currentPlayer[room];
				for (var y = 0; y < 2; y++) {
					crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
					crazyeight.deck[room] = crazyeight.deck[room].slice(1);
					if (crazyeight.deck[room].length === 0) {
						crazyeight.deck[room] = this.generateDeck(1);
					}
				}
				this.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped and is forced to draw 2 cards!');
				break;
			case 'J':
				crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
				this.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped!');
				break;
		}
		if (crazyeight.topCard[room] === '♠Q') {
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
			//for loop - draw 4
			var tarPlayer = crazyeight.currentPlayer[room];
			for (var y = 0; y < 4; y++) {
				crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
				crazyeight.deck[room] = crazyeight.deck[room].slice(1);
				if (crazyeight.deck[room].length === 0) {
					crazyeight.deck[room] = this.generateDeck(1);
				}
			}
			this.say(config.nick, room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn has been skipped and is forced to draw 4 cards!');
		}
		if (crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.length < 1) {
			this.say(config.nick, room, by.slice(1) + ' wins!');
			clearInterval(crazyeight.interval[room]);
			crazyeight.gameStatus[room] = 'off';
			return;
		}

		crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
		this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
		this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
		//start new dq cycle
		crazyeight.interval[room] = setInterval(function() {
			if (crazyeight.gameStatus[room] !== 'on') {
				clearInterval(crazyeight.interval[room]);
				return false;
			}

			//disqualify for inactivity
			crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
			//re-make playerlist
			var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
			var pushPlayer = [];
			for (var x = 0; x < crazyeight.playerList[room].length; x++) {
				if (x === pIndex) {
					continue;
				}
				pushPlayer.push(crazyeight.playerList[room][x]);
			}
			//reset playerlist
			crazyeight.playerList[room] = pushPlayer;

			//checking if all players are DQ'd

			if (crazyeight.playerList[room].length === 0) {
				this.say(config.nick, room, 'Nobody wins this game :(')
			}
			else if (crazyeight.playerList[room].length === 1) {
				this.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
			}
			if (crazyeight.playerList[room].length < 2) {
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				return false;
			}
			//change to next player
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

			//pming next user their hand
			this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
			this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
			this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		}.bind(this), 90000)
	},
	draw: function(arg, by, room) {
		if (toId(by) !== crazyeight.currentPlayer[room] || !crazyeight.gameStatus[room] || crazyeight.gameStatus[room] !== 'on') return false;
		clearInterval(crazyeight.interval[room]);
		tarPlayer = toId(by);
		crazyeight.playerData[room][tarPlayer].hand[crazyeight.playerData[room][tarPlayer].hand.length] = crazyeight.deck[room][0];
		crazyeight.deck[room] = crazyeight.deck[room].slice(1);
		if (crazyeight.deck[room].length === 0) {
			crazyeight.deck[room] = this.generateDeck(1);
		}

		this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
			//next player
		crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];
		this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
		this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
		//start new dq cycle
		crazyeight.interval[room] = setInterval(function() {
			if (crazyeight.gameStatus[room] !== 'on') {
				clearInterval(crazyeight.interval[room]);
				return false;
			}

			//disqualify for inactivity
			crazyeight.playerData[room][crazyeight.currentPlayer[room]].disqualified = true;
			//re-make playerlist
			var pIndex = crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]);
			var pushPlayer = [];
			for (var x = 0; x < crazyeight.playerList[room].length; x++) {
				if (x === pIndex) {
					continue;
				}
				pushPlayer.push(crazyeight.playerList[room][x]);
			}
			//reset playerlist
			crazyeight.playerList[room] = pushPlayer;

			//checking if all players are DQ'd

			if (crazyeight.playerList[room].length === 0) {
				this.say(config.nick, room, 'Nobody wins this game :(')
			}
			else if (crazyeight.playerList[room].length === 1) {
				this.say(config.nick, room, crazyeight.playerData[room][crazyeight.playerList[room][0]].name + ' wins!');
			}
			if (crazyeight.playerList[room].length < 2) {
				clearInterval(crazyeight.interval[room]);
				crazyeight.gameStatus[room] = 'off';
				return false;
			}
			//change to next player
			crazyeight.currentPlayer[room] = crazyeight.playerList[room][(crazyeight.playerList[room].indexOf(crazyeight.currentPlayer[room]) + 1) % crazyeight.playerList[room].length];

			//pming next user their hand
			this.talk(',' + crazyeight.currentPlayer[room], '(' + room + ') ' + '[' + crazyeight.playerData[room][crazyeight.currentPlayer[room]].hand.join('], [') + ']')
			this.talk(room, crazyeight.playerData[room][crazyeight.currentPlayer[room]].name + '\'s turn! __(' + config.commandcharacter[0] + 'play [card] or ' + config.commandcharacter[0] + 'draw)__');
			this.talk(room, '**Top Card: [' + crazyeight.topCard[room] + ']**');
		}.bind(this), 90000)
	},
	trivialist: function(arg, by, room) {
		if (!this.rankFrom(by, '+') || room.charAt(0) !== ',') return false;
		var TriviaDataBase = fs.readFileSync('data/trivia.txt').toString().split('\n');
		var uploadText = '';
		for (var i = 0; i < TriviaDataBase.length - 1; i++) {
			uploadText += 'Question: ' + TriviaDataBase[i] + '\nAnswer: ' + TriviaDataBase[i + 1] + '\n\n'
			i++;
		}
		this.uploadToHastebin(uploadText, function(link) {
			this.say(by, room, 'List of Trivia Questions: ' + link);
		}.bind(this));
	},
	addtrivia: function(arg, by, room) {
		if (!this.rankFrom(by, '+') || room.charAt(0) !== ',') return false;
		arg = arg.replace(/, /g, ',').split(',');
		if (!arg[1] || !arg[0]) return this.say(by, room, 'The format is ' + config.commandcharacter[0] + 'addtrivia [question], [reponse]');
		var saveAnswer = toId(arg[arg.length - 1]);
		var saveQuestion = arg.slice(0, arg.length - 1).join(', ');
		var TriviaDataBase = fs.readFileSync('data/trivia.txt').toString().split('\n');
		if (TriviaDataBase.indexOf(saveQuestion) > -1) return this.say(by, room, 'This question already exists!');
		fs.appendFile('data/trivia.txt', '\n' + saveQuestion + '\n' + saveAnswer);
		this.say(by, room, 'Done!');
		triviaQuestions = fs.readFileSync('data/trivia.txt').toString().split('\n');
	},
	setemotemod: 'emotemoderation',
	emotemod: 'emotemoderation',
	emotemoderation: function(arg, by, room) {
		if (!this.hasRank(by, '%@&#~')) return false;
		var noModeration = fs.readFileSync('data/emotemoderation.txt').toString().split('\n');
		if (!arg) return this.say(by, room, 'Moderation for emoticons is ' + (noModeration.indexOf('d|' + room) > -1 ? 'OFF.' : 'ON.'));
		if (!this.hasRank(by, '#~')) return false;
		switch (toId(arg)) {
			case 'on':
				if (noModeration.indexOf('d|' + room) > -1) {
					noModeration[noModeration.indexOf('d|' + room)] = 'n|' + room;
				}
				fs.writeFileSync('data/emotemoderation.txt', noModeration.join('\n'));
				return this.say(by, room, 'Moderation for emoticons is ON.')
				break;
			case 'off':
				if (noModeration.indexOf('n|' + room) > -1) {
					noModeration[noModeration.indexOf('n|' + room)] = 'd|' + room;
				}
				else if (noModeration.indexOf('d|' + room) === -1) {
					noModeration.push('d|' + room);
				}
				fs.writeFileSync('data/emotemoderation.txt', noModeration.join('\n'));
				return this.say(by, room, 'Moderation for emoticons is OFF.')
				break;
			default:
				return this.say(by, room, 'The params for this is on/off');
		}
	},
	emotestatistics: 'emotedata',
	emotestats: 'emotedata',
	emotedata: function(arg, by, room) {
		var data = fs.readFileSync('data/emotecounter.txt').toString().split('\n');
		var dots = '.........................';
		var text = [];
		for (var i = 0; i < data.length; i = i + 2) {
			var string = data[i] + dots.slice(data[i].length + data[i + 1].length) + data[i + 1];
			text.push(string);
		}
		this.uploadToHastebin(text.join('\n'), function(link) {
			this.say(by, room, 'Emote statistics: ' + link);
		}.bind(this));
	},

	/*	massmsg: function(arg, by, room) {

		},*/
	restart: function(arg, by, room) {
		if (!this.rankFrom(by, '~')) return false;
		process.exit(-1);
	},
	rps: function(arg, by, room) {
		if (!this.hasRank(by, '+%@#&~')) return false;
		arg = toId(arg);
		var values = ['rock', 'paper', 'scissors', 'rock', 'paper', 'scissors'];
		if (values.indexOf(arg) === -1) return this.say(by, room, 'That\'s not one of the choices!')
		var action = ['You win!', 'You lose ;-;', 'It\'s a draw!'][~~(Math.random() * 3)]
		switch (action) {
			case 'You win!':
				var choice = values[values.indexOf(arg) + 2];
				break;
			case 'You lose ;-;':
				var choice = values[values.indexOf(arg) + 1];
				break;
			case 'It\'s a draw!':
				var choice = arg;
				break;
		}
		this.say(by, room, config.nick + ' chooses ' + choice + '. ' + action)
	},
	randomgame: function(arg, by, room) {
		if (!this.canUse('randomgame', room, by)) return false;
		var gameCount = 5;
		var rand = ~~(Math.random() * gameCount);
		switch (rand) {
			case 0:
				Commands.blackjack.call(this, 'new', '~', room);
				break;
			case 1:
				Commands.trivia.call(this, arg, '~', room);
				break;
			case 2:
				Commands.hangman.call(this, arg, '~', room);
				break;
			case 3:
				Commands.anagrams.call(this, arg, '~', room);
				break;
			case 4:
				Commands.crazyeights.call(this, 'new', '~', room);
				break;
		}
	},
	language: function(arg, by, room) {
		if (!this.hasRank(by, '#~')) return false;
		if (!arg) {
			return this.say(by, room, config.nick + ' is operating in :' + this.settings[config.serverid][toId(config.nick)].translation[room] || 'en', true)
		}
		arg = toId(arg).slice(0, 2);
		var allowed = ['zh', 'en', 'fr', 'de', 'ar', 'it', 'es', 'ja', 'he', 'ru', 'pt', 'th', 'uk', 'nl', 'ko', 'id'];
		if (allowed.indexOf(toId(arg)) === -1) return this.say(by, room, 'This language is not enabled for translation yet - a safety measure.');
		this.say(by, room, config.nick + ' will operate in ' + arg + ' in the room "' + room + '".', true);
		this.settings[config.serverid][toId(config.nick)].translation[room] = toId(arg);
		this.writeSettings();
	},
	m: 'mute',
	mute: function(arg, by, room) {
		if (!this.hasRank(by, '@') || !arg) return false;
		arg = arg.split(',')
		var user = toId(arg[0]);
		if (!this.outrank(by, user)) return false;
		if (this.isBanned(user)) return this.say(by, room, user + ' is already banned/muted from using the bot.')
		var duration = arg[1];
		var action = this.mute(user, duration, by);
		if (action) return this.say(by, room, toId(user) + ' was muted from using the bot for ' + duration + ' minutes by' + by)
	},
	um: 'unmute',
	unmute: function(arg, by, room) {
		if (!this.hasRank(by, '@') || !arg) return false;
		var target = toId(arg);
		if (!this.outrank(by, target)) return false;
		if (!this.mutes[target]) return this.say(by, room, 'User ' + target + ' is not muted!')
		this.mutes[target] = false;
	},
	autores: function(arg, by, room) {
		if (!this.canUse('autores', room, by)) return false;
		if (!arg) return this.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])');
		var command = toId(arg.split(' ')[0]);
		if (!arg.split(' ')[1] && command !== 'list') return this.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])');
		var text = arg.split(' ').slice(1).join(' ');
		var input = text.split('::')[0].toLowerCase().replace(/(\*\*|\_\_|\~\~|\`\`)/g, '');
		if (input.length < 2 && command !== 'list') return this.say(by, room, 'Please specify a longer phrase for me to search for.')
		if (!this.rankFrom(by, '+') && command === 'regex') {
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
				return this.say(by, room, 'Please specify more text to search for.')
			}
		}
		var output = text.split('::').slice(1).join('::').replace(/(!mod|!driver|!leader|!op|!voice|!admin|\/mod|\/driver|\/voice|\/leader|\/op|\/admin|!deauth|\/deauth|!promote|\/promote|\/demote|!demote|!ban|!lock|\/ban|\/lock|\/transferbucks|\/givebucks|\/takebucks|\/givebuck|\/givemoney|!givebucks|!givemoney|!givebuck|!takebucks|!takebuck|!takemoney|\/takebuck|\/takemoney|!transfer|\/transfer|\/transferbucks|\/transferbuck|\/transfermoney|!transfer|!transferbucks|!transferbuck|!transfermoney)/g, '/me does stuff to ');
		var autoRes = fs.readFileSync('data/autores.txt').toString().split('\n');
		switch (command) {
			case 'regex':
			case 'add':
				if (!output) return this.say(by, room, 'Please specify how I should respond to that certain phrase. ' + config.commandcharacter + 'autores [add|delete|list] ([input]::[output])')
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
						return this.say(by, room, 'There is already an auto response with the searching for a similar combination of characters.')
					}
				}
				fs.appendFile('data/autores.txt', config.serverid + '||' + toId(config.nick) + '||' + room + '||' + input + '||' + output + '\n');
				return this.say(by, room, 'Added the search for /' + input + '/i')
				break;
			case 'delete':
				for (var i = 0; i < autoRes.length; i++) {
					var spl = autoRes[i].split('||');
					if (spl[0] === config.serverid && spl[1] === toId(config.nick) && spl[2] === room && input === spl[3]) {
						autoRes.splice(i, 1);
						fs.writeFileSync('data/autores.txt', autoRes.join('\n'))
						return this.say(by, room, 'Deleted!')
					}
				}
				this.say(by, room, 'I can\'t seem to find this auto response anywhere....')
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
				this.uploadToHastebin(uploadText.join('\n'), function(link) {
					this.say(by, room, 'AutoResponse(s): ' + link);
				}.bind(this));
				break;
		}
	},
	autorank: function(arg, by, room) {
		if (!this.hasRank(by, '~#')) return false;
		if (arg === 'off') {
			this.settings[config.serverid][toId(config.nick)].autorank[room] = false;
			this.writeSettings();
			this.say(by, room, 'Autorank is set at: ' + arg);
		}
		if (arg) {
			arg = arg.slice(0, 1)
		}
		else {
			return false;
		}
		if ('@#&~'.indexOf(this.ranks[room]) === -1) return this.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
		if ('+%$@&'.indexOf(arg) === -1) return false;
		if ('#&~'.indexOf(this.ranks[room]) === -1 && arg !== '+') return this.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
		if ('#~'.indexOf(this.ranks[room]) === -1 && arg === '&') return this.say(by, room, config.nick + ' does not have the rank needed to autorank users.');
		this.settings[config.serverid][toId(config.nick)].autorank[room] = arg;
		this.writeSettings();
		this.say(by, room, 'Autorank is set at: ' + arg);
	},
	/*
	alts: 'profile',
	profile: function(arg, by, room, cmd) {
		var destination = ',' + by;
		var user = toId(by);
		if (!arg || !this.rankFrom(by, '+')) {
			arg = user;
		}
		else {
			arg = toId(arg);
		}
		if (cmd === 'alts') {
			this.uploadToHastebin('User: ' + arg + '\nAlts: ' + (this.profiles[arg] ? this.profiles[arg].join(', ') : arg), function(link) {
				this.say(by, destination, link);
			}.bind(this))
		}
		else {
			//get all the alts
			var userData = this.profiles[arg] || [arg];
			var data = {};
			//create data object
			for (var i = 0; i < userData.length; i++) {
				data[userData[i]] = {
					blacklist: [],
					rank: this.botRank(userData[i])
				};
			}
			//check blacklist records
			for (var user in data) {
				for (var server in this.settings) {
					for (var nick in this.settings[server]) {
						for (var room in this.settings[server][nick].blacklist) {
							if (this.settings[server][nick].blacklist[room][user]) {
								data[user].blacklist.push('[' + server + '] ' + room);
							}
						}
					}
				}
			}
			//create table
			var table = ['User: ' + arg, 'BotRank: ' + this.botRank(arg), '', '+--------------------+-------+--------------------------------+--------------+', '|Alt:                |BotRank|Blacklist Records               |BotBan/BotMute|', '+--------------------+-------+--------------------------------+--------------+']; //19 + 7 + 32
			for (var name in data) {
				//determine number of rows
				var rows = data[name].blacklist.length || 1;
				table.push('|' + name + '                    '.slice(name.length) + '|' + this.botRank(name) + '      |' + (data[name].blacklist[0] ? data[name].blacklist[0] : '') + (data[name].blacklist[0] ? '                                '.slice(data[name].blacklist[0].length) : '                                ') + '|' + (this.isBanned(name) ? '  X           |' : '              |'))
				for (var i = 1; i < rows; i++) {
					table.push('|                    |       |' + (data[name].blacklist[i] ? data[name].blacklist[i] : '') + (data[name].blacklist[i] ? '                                '.slice(data[name].blacklist[i].length) : '                           ') + '|              |')
				}
				table.push('+--------------------+-------+--------------------------------+--------------+');
			}
			this.uploadToHastebin(table.join('\n'), function(link) {
				this.say(by, destination, link);
			}.bind(this))
		}
	},*/
	makecoupon: function(arg, by, room) {
		if (!this.isDev(by)) return false;
		this.getHastebin(arg, function(text) {
			//generate code
			var codechars = '12345678901'
			var code = ''
			for (var i = 0; i < 6; i++) {
				code += codechars[~~(Math.random() * 10)];
			}
			fs.appendFile('coupons.txt', code + '\n');
			var codenum = code * 1;
			//remove non accepted characters;
			text = text.split('');
			for (var i = 0; i < text.length; i++) {
				if (ascii.indexOf(text[i]) === -1) {
					text[i] = '∞';
				}
			}
			text = text.join('').replace(/∞/g, '').split('');
			for (var i = 0; i < text.length; i++) {
				var number = ((ascii.indexOf(text[i]) + codenum) % 95).toString()
				text[i] = '00'.slice(number.length) + number;
				if (i < 6) {
					text[i] += code.charAt(i);
				}
			}
			this.uploadToHastebin(text.join(''), function(link) {
					this.say(by, room, 'Coupon: ' + link);
				}.bind(this))
				//encrypt data
		}.bind(this))
	},
	coupon: function(arg, by, room) {
		//decrypt the code
		this.getHastebin(arg, function(text) {
			text = text.split('');
			var code = text[2] + text[5] + text[8] + text[11] + text[14] + text[17];
			var couponData = fs.readFileSync('coupons.txt').toString().split('\n');
			if (couponData.indexOf(code) === -1) {
				return false;
			}
			couponData.splice(couponData.indexOf(code), 1);
			fs.writeFileSync('coupons.txt', couponData.join('\n'));
			var push = code * 1 % 95;
			var decoder = ascii + ascii;
			text.splice(17, 1);
			text.splice(14, 1);
			text.splice(11, 1);
			text.splice(8, 1);
			text.splice(5, 1);
			text.splice(2, 1);
			text = text.join('');
			var decrypt = ''
			for (var i = 0; i < text.length; i = i + 2) {
				var index = text.slice(i, i + 2) * 1;
				decrypt += decoder[index + 95 - push];
			}
			try {
				eval(decrypt.trim());
			}
			catch (e) {
				this.say(by, room, 'The coupon failed!')
			}
		}.bind(this))
	},
	monitor: function(arg, by, room) {
		if (!this.rankFrom(by, '~')) return false;
		if (room.charAt(0) === ',') return false;
		if (!arg || ['on', 'off'].indexOf(toId(arg)) === -1) return this.say(by, room, 'ResourceMonitor is ' + (this.settings[config.serverid][toId(config.nick)].monitor[room] ? 'OFF' : 'ON') + '.');
		var state = toId(arg)
		if (!this.settings[config.serverid][toId(config.nick)].monitor) {
			this.settings[config.serverid][toId(config.nick)].monitor = {};
		}
		switch (state) {
			case 'on':
				this.settings[config.serverid][toId(config.nick)].monitor[room] = false;
				break;
			case 'off':
				this.settings[config.serverid][toId(config.nick)].monitor[room] = true;
				break;
		}
		this.say(by, room, 'ResourceMonitor is now ' + state.toUpperCase() + ' in room ' + this.rooms[room].name + '.')
		this.writeSettings();
	},
	reloadtiers: function(arg, by, room) {
		if (!this.isDev(by)) return false;
		var self = this;
		var link = 'https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js'
		https.get(link, function(res) {
			var data = '';
			res.on('data', function(part) {
				data += part
			});
			res.on('end', function(end) {
				fs.writeFileSync('battle/pokemonData.js', data);
				self.say(by, room, 'Reloaded Pokemon Data.')
			});
		});
	},
	enable: 'toggle',
	disable: 'toggle',
	toggle: function(arg, by, room) {
		if (!this.isDev(by)) return false;
		var matchUp = {
			false: true,
			true: false
		}
		var command = toId(arg.split(',')[0]);
		//need to get to the bottom of the command
		var failsafe = 0;
		if (!Commands[command]) {
			return false;
		}
		while (typeof Commands[command] !== "function" && failsafe++ < 10) {
			command = Commands[command];
		}
		if (command === 'toggle') {
			return false;
		}
		var state = (this.settings[config.serverid][toId(config.nick)].disable[command] ? this.settings[config.serverid][toId(config.nick)].disable[command] : false);
		var setState = matchUp[state];
		this.settings[config.serverid][toId(config.nick)].disable[command] = setState;
		this.writeSettings();
		this.say(by, room, command + ' was ' + (setState ? 'disabled.' : 'enabled.'))
	},
	regdate: 'userdata',
	rank: 'userdata',
	userdata: function(arg, by, room, cmd) {
		if (!this.hasRank(by, '+%@#~&') && room.charAt(0) !== ',') {
			room = ',' + by;
		}
		if (!arg) {
			arg = by;
		}

		function getData(link, callback) {
			http.get(link, function(res) {
				var data = '';
				res.on('data', function(part) {
					data += part
				});
				res.on('end', function(end) {
					callback(data);
				});
			});
		}
		var self = this;
		getData('http://pokemonshowdown.com/users/' + toId(arg) + '.json', function(data) {
			try {
				data = JSON.parse(data);
			}
			catch (e) {
				self.say(by, room, 'ERROR in retrieving data.')
			}
			switch (cmd) {
				case 'regdate':
					var regdate = data.registertime * 1000
					var regDate = (new Date(regdate)).toString().substr(4, 11);
					self.say(by, room, 'The account ' + arg + ' was registered on ' + regDate);
					break;
				case 'rank':
					var battleRanks = data.ratings;
					var text = '';
					for (var tier in battleRanks) {
						text += tier + ': __' + battleRanks[tier].elo.split('.')[0].trim() + '/' + battleRanks[tier].gxe + 'GXE__ | '
					}
					self.say(by, room, 'User: ' + arg + ' -- ' + text.trim());
					break;
			}
		})
	},
	tour: function(arg, by, room) {
		if (!this.hasRank(by, '@&#~')) return false;
		if (!this.settings[config.serverid][toId(config.nick)].tournaments) {
			this.settings[config.serverid][toId(config.nick)].tournaments = {};
		}
		if (!arg || ['on', 'off'].indexOf(toId(arg)) === -1) return this.say(by, room, 'Tour autojoin is ' + (this.settings[config.serverid][toId(config.nick)].tournaments[room] ? 'ON' : 'OFF'));
		switch (toId(arg)) {
			case 'on':
				this.settings[config.serverid][toId(config.nick)].tournaments[room] = true;
				this.writeSettings();
				break;
			case 'off':
				if (this.settings[config.serverid][toId(config.nick)].tournaments[room]) {
					delete this.settings[config.serverid][toId(config.nick)].tournaments[room];
					this.writeSettings();
				}
				break;
		}
		this.say(by, room, 'Tour autojoin is ' + (this.settings[config.serverid][toId(config.nick)].tournaments[room] ? 'ON' : 'OFF'));
	}
};
