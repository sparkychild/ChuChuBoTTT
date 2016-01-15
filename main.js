
    
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
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
	if (config.debuglevel > 1 && config.debuglevel !== 6) return;
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

function loadFunctions() {
	global.Commands = {};
	global.Parse = require('./parser.js').parse;
	var commandFiles = fs.readdirSync('./commands/');
	for (var i = 0; i < commandFiles.length; i++) {
		try {
			Object.merge(Commands, require('./commands/' + commandFiles[i]).commands);
			ok('Loaded command files: ' + commandFiles[i])
		}
		catch (e) {
			error('Unable to load command files: ' + commandFiles[i]);
			console.log(e.stack)
		}
	}
}

if (config.url && !config.override) {
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
				try {
					data = JSON.parse(data);

				}
				catch (e) {}
				console.log(data);
				config.server = data.host;
				config.port = data.port;
				config.serverid = data.id;
				//fk rhcloud's port issue
				if (config.server.indexOf('rhcloud') > -1) {
					config.port = 8000;
				}
				//The rooms that should be joined.
				//autojoin code
				try {
					config.rooms = JSON.parse(fs.readFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json'));;
				}
				catch (e) {
					config.rooms = [];
					info('Rooms are not loaded.')
				}
				global.globalvar = require('./globals.js');
				loadFunctions();
				connect();
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
else if (!config.override) {
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
ok('starting server');
var WebSocketClient = require('websocket').client;


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
			Parse.rooms = {}

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

if (config.override) {
	config.server = config.override.server;
	config.port = config.override.port;
	config.serverid = config.override.serverid;
	try {
		config.rooms = JSON.parse(fs.readFileSync('data/newrooms/' + config.nick + '_' + config.serverid + '.json'));;
	}
	catch (e) {
		config.rooms = [];
		info('Rooms are not loaded.')
	}
	global.globalvar = require('./globals.js');
	loadFunctions();
	connect();
}
