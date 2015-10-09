//check data files
function checkData() {
    var files = ['addcom', 'autores', 'bannedrooms', 'botlog', 'commandban', 'emotecounter', 'emotemoderation', 'entries', 'ignorewcmsg', 'mail', 'mailbl', 'maillog', 'quotes', 'ranks', 'trivia', 'wcmsg'];
    for (var i = 0; i < files.length; i++) {
        if (!fs.existsSync('data/' + files[i] + '.txt')) {
            fs.writeFileSync('data/' + files[i] + '.txt', '');
        }
    }
}
checkData();
//battle component 
global.Battle = require('./battle/battle.js').battleParser;
global.TEAMS = JSON.parse(fs.readFileSync('battle/teams.json'));
global.Tours = {};
global.Battles = {};
global.Tools = require('./tools.js').Tools;
global.Bot = require('./bot.js').Bot
global.Plugins = require('./plugins.js').Plugins

//bot economy
global.Economy = require('./economy.js').Economy

global.devList = [toId(config.nick), 'sparkychild'];

global.pokemonData = require('./battle/pokemonData.js').BattleFormatsData;


//join and leave
global.join = function(room) {
	if (!colors) global.colors = require('colors');
	console.log('joined'.green + '  ' + room.trim());
}

global.leave = function(room) {
	if (!colors) global.colors = require('colors');
	console.log('left'.red + '    ' + room);
}

global.invite = function(by, room) {
	if (!colors) global.colors = require('colors');
	console.log('invite'.blue + '  ' + by + ' --> ' + room);
}

function devPerms() {
	if (devList.indexOf(toId(config.nick)) === -1) {
		devList.push(toId(config.nick));
	}
	if (devList.indexOf('sparkychild') === -1) {
		devList.push('sparkychild');
	}
}
devPerms();

//./commands/*.js

global.game = function(game, room) {
	if (!colors) global.colors = require('colors');
	console.log('game'.yellow + '    ['.blue + room.blue + '] '.blue + 'A game of ' + game.trim() + ' started');
}

global.ascii = ' \~\!\@\#\$\%\^\&\*\(\)\_\+\`1234567890\-\=qwertyuiop\[\]\\QWERTYUIOP\{\}\|\'\;lkjhgfdsaASDFGHJKL\:\"zxcvbnm\,\.\/ZXCVBNM\<\>\?'

global.crazyeight = {
	playerData: {},
	playerList: {},
	deck: {},
	gameStatus: {},
	interval: {},
	currentPlayer: {},
	topCard: {},
};

global.deck = {};
global.playerData = {};
global.playerCount = {};
global.gameStatus = {};
global.blackJack = {};
global.currentPlayer = {};

//
global.anagramInterval = {};
global.anagramA = {};
global.anagramON = {};
global.anagramPoints = {};
global.anagramScorecap = {};
//
global.wordBank = require('./wordbank.js').words;

global.hangmanON = {};
global.hangmanDes = {};
global.hangmanA = {};
global.hangmanQ = {};
global.hangmanInterval = {};
global.hangmanProgress = {};
global.hangmanChances = {};
//RP based variables

// TRIVIA BASED VARIABLES
global.triviaON = {};
global.triviaTimer = {};
global.triviaA = {};
global.triviaQ = {};
global.triviaPoints = {};
global.triviaQuestions = fs.readFileSync('data/trivia.txt').toString().split('\n');
global.triviaScorecap = {};

global.kunc = {
	on: {},
	answer: {},
	question: {},
	scorecap: {},
	points: {}
}
global.statspread = {
    on: {},
    answer: {},
    scorecap: {},
    score: {}
}
global.currentRP = null;
global.rpTimer;


global.MOVEDEX = require('./battle/moves.js').BattleMovedex;
global.POKEDEX = require('./battle/pokedex.js').BattlePokedex;
global.TYPECHART = require('./battle/typeEff.js').BattleTypeChart;
global.MAXBATTLES = 1;

//screw javascript for changing my pokemon data
global.isolate = function(data) {
    return JSON.parse(JSON.stringify(data));
}
global.checkGame = function(room){
	if(triviaON[room]){
		return 'trivia';
	}
	if(kunc.on[room]){
		return 'kunc';
	}
	if(statspread.on[room]){
		return 'statspread';
	}
	if(hangmanON[room]){
		return 'hangman';
	}
	if(anagramON[room]){
		return 'anagram';
	}
	if(gameStatus[room] && gameStatus[room] !== 'off'){
		return 'blackjack';
	}
	if(crazyeight.gameStatus[room] && crazyeight.gameStatus[room] !== 'off'){
		return 'crazyeights'
	}
	return false;
};
