/**
 * This is the main file of Pokémon Showdown Bot
 *
 * Some parts of this code are taken from the Pokémon Showdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */
var sys = require('sys');
var url = require('url');
var http = require('http');

global.monitor = function(text) {
	if (!colors) global.colors = require('colors');
	console.log('monitor'.red + ' ' + text.red);
};
global.info = function(text) {
	if (config.debuglevel > 3) return;
	if (!colors) global.colors = require('colors');
	console.log('info'.cyan + '    ' + text);
};

global.debug = function(text) {
	if (config.debuglevel > 2) return;
	if (!colors) global.colors = require('colors');
	console.log('debug'.blue + '   ' + text);
};

global.recv = function(text) {
	if (config.debuglevel > 0) return;
	if (!colors) global.colors = require('colors');
	console.log('recv'.grey + '    ' + text);
};

global.cmdr = function(text) { // receiving commands
	if (config.debuglevel !== 1) return;
	if (!colors) global.colors = require('colors');
	console.log('cmdr'.grey + '    ' + text);
};

global.dsend = function(text) {
	if (config.debuglevel > 1) return;
	if (!colors) global.colors = require('colors');
	console.log('send'.grey + '    ' + text);
};

global.error = function(text) {
	if (!colors) global.colors = require('colors');
	console.log('error'.red + '   ' + text);
};

global.ok = function(text) {
	if (config.debuglevel > 4) return;
	if (!colors) global.colors = require('colors');
	console.log('ok'.green + '      ' + text);
};

global.toId = function(text) {
	return text.toLowerCase().replace(/[^a-z0-9]/g, '');
};

global.stripCommands = function(text) {
	text = text.trim();
	if (text.charAt(0) === '/') return '/' + text;
	if (text.charAt(0) === '!' || /^>>>? /.test(text)) return '!' + text;
	return text;
};

function runNpm(command) {
	console.log('Running `npm ' + command + '`...');

	var child_process = require('child_process');
	var npm = child_process.spawn('npm', [command]);

	npm.stdout.on('data', function(data) {
		process.stdout.write(data);
	});

	npm.stderr.on('data', function(data) {
		process.stderr.write(data);
	});

	npm.on('close', function(code) {
		if (!code) {
			child_process.fork('main.js').disconnect();
		}
	});
}

// Check if everything that is needed is available
try {
	require('sugar');
	require('colors');
}
catch (e) {
	console.log('Dependencies are not installed!');
	return runNpm('install');
}

if (!Object.select) {
	console.log('Node needs to be updated!');
	return runNpm('update');
}

// First dependencies and welcome message
var sys = require('sys');
global.colors = require('colors');

console.log('------------------------------------'.yellow);
console.log('| Welcome to Pokemon Showdown Bot! |'.yellow);
console.log('------------------------------------'.yellow);
console.log('');

// Config and config.js watching...
global.fs = require('fs');
if (!('existsSync' in fs)) {
	fs.existsSync = require('path').existsSync;
}

if (!fs.existsSync('./config.js')) {
	error('config.js doesn\'t exist; are you sure you copied config-example.js to config.js?');
	process.exit(-1);
}

global.config = require('./config.js');

if (config.url) {
	var serverUrl = config.url;
	if (serverUrl.indexOf('://') !== -1) {
		serverUrl = url.parse(serverUrl).host;
	}
	if (serverUrl.slice(-1) === '/') {
		serverUrl = serverUrl.slice(0, -1);
	}

	console.log('Getting data for ' + serverUrl + '...');
	console.log('This may take some time, depending on Showdown\'s speed.');

	var received = false;
	var requestOptions = {
		hostname: 'play.pokemonshowdown.com',
		port: 80,
		path: '/crossdomain.php?host=' + serverUrl + '&path=',
		method: 'GET'
	};
	var req = http.request(requestOptions, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			if (received) {
				return;
			}
			received = true;

			var search = 'var config = ';
			var index = chunk.indexOf(search);
			if (index !== -1) {
				var data = chunk.substr(index);
				data = data.substr(search.length, data.indexOf(';') - search.length);
				data = JSON.parse(data);
				config.server = data.host;
				config.port = data.port;
				config.serverid = data.id;
				//fk rhcloud's port issue
				if (config.server.indexOf('rhcloud') > -1) {
					config.port = 8000;
				}
				// The rooms that should be joined.
				//autojoin code
				try {
					config.rooms = JSON.parse(fs.readFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json'));;
				}
				catch (e) {
					config.rooms = [];
					console.log('Rooms are not loaded.')
				}
			}
			else {
				console.log('ERROR: failed to get data!');
				process.exit(-1)
			}
		});
	});

	req.on('error', function(err) {
		console.log('ERROR: ' + sys.inspect(err));
		process.exit(-1)
	});

	req.end();
}
else {
	console.log('ERROR: no URL specified!');
	process.exit(-1)
}


var checkCommandCharacter = function() {
	if (!/[^a-z0-9 ]/i.test(config.commandcharacter)) {
		error('invalid command character; should at least contain one non-alphanumeric character');
		process.exit(-1);
	}
};
checkCommandCharacter();

var watchFile = function() {
	try {
		return fs.watchFile.apply(fs, arguments);
	}
	catch (e) {
		error('your version of node does not support `fs.watchFile`');
	}
};

if (config.watchconfig) {
	watchFile('./config.js', function(curr, prev) {
		if (curr.mtime <= prev.mtime) return;
		try {
			delete require.cache[require.resolve('./config.js')];
			config = require('./config.js');
			info('reloaded config.js');
			checkCommandCharacter();
		}
		catch (e) {}
	});
}

// And now comes the real stuff...
info('starting server');

var WebSocketClient = require('websocket').client;
global.Commands = require('./commands.js').commands;
global.Parse = require('./parser.js').parse;
try {
	Object.merge(Commands, require('./battle/battle.js').commands);
}
catch (e) {
	error("Could not import commands file: BattleEngine | " + sys.inspect(e));
}

var connection = null;
var queue = [];
var dequeuing = false;
var lastSentAt = 0;

global.cleanBuffer = function(user) {
	if (!user) return false;
	var newQueue = [];
	for (var i = 0; i < queue.length; i++) {
		if (queue[i].user === user) {
			continue;
		}
		newQueue.push(queue[i])
	}
	queue = newQueue;
}

function dequeue() {
	var data = queue.shift();
	if (!data) {
		dequeuing = false;
		return false;
	}
	send(data.data, data.user);
};

global.send = function(data, user) {
	if (!connection.connected || !data) return false;
	if (!user) {
		user = toId(config.nick);
	}
	var now = Date.now();
	var diff = now - lastSentAt;
	if (diff < 655) {
		queue.push({
			'data': data,
			'user': user
		});
		if (!dequeuing) {
			dequeuing = true;
			setTimeout(dequeue, 675 - diff);
		}
		return false;
	}
	if (!Array.isArray(data)) data = [data.toString()];
	data = JSON.stringify(data);
	dsend(data);
	connection.send(data);

	lastSentAt = now;
	if (dequeuing) {
		if (queue.length) {
			setTimeout(dequeue, 675);
		}
		else {
			dequeuing = false;
		}
	}
};

var connect = function(retry) {
	if (retry) {
		info('retrying...');
	}

	var ws = new WebSocketClient();

	ws.on('connectFailed', function(err) {
		error('Could not connect to server ' + config.server + ': ' + sys.inspect(err));
		info('retrying in one minute');

		setTimeout(function() {
			connect(true);
		}, 60000);
	});

	ws.on('connect', function(con) {
		connection = con;
		ok('connected to server ' + config.server);

		con.on('error', function(err) {
			error('connection error: ' + sys.inspect(err));
		});

		con.on('close', function() {
			// Is this always error or can this be intended...?
			error('connection closed: ' + sys.inspect(arguments));
			info('retrying in one minute');

			setTimeout(function() {
				connect(true);
			}, 60000);
		});

		con.on('message', function(message) {
			if (message.type === 'utf8') {
				recv(sys.inspect(message.utf8Data));
				Parse.data(message.utf8Data);

			}
		});
	});

	// The connection itself
	var id = ~~(Math.random() * 900) + 100;
	var chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
	var str = '';
	for (var i = 0, l = chars.length; i < 8; i++) {
		str += chars.charAt(~~(Math.random() * l));
	}

	var conStr = 'ws://' + config.server + ':' + config.port + '/showdown/' + id + '/' + str + '/websocket';
	info('connecting to ' + conStr + ' - secondary protocols: ' + sys.inspect(config.secprotocols));
	ws.connect(conStr, config.secprotocols);
};

setTimeout(function() {
	connect();
}.bind(this), 1000)
