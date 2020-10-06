const express = require('express');
const { connect, TimeoutError } = require('working-rcon');
const prometheus = require('prom-client');

const { Gauge } = prometheus;

const app = express();

async function rconCommand(client, command) {
	try {
		return client.command(command);
	} catch (err) {
		if (err instanceof TimeoutError) {
			console.error('request timed out');
		} else {
			throw err;
		}
	}
	return null;
}

async function getMetamod(client) {
	return rconCommand(client, 'meta');
}

function metamodRequest(response) {
	if (response) {
		const isEnabled = isValidResponse(response);
		metamodEnabledGauge.set(isEnabled ? Number(1) : Number(0));
	} else {
		metamodEnabledGauge.set((Number(-1)));
	}
}

async function getSourcemod(client) {
	return rconCommand(client, 'sm');
}

function sourcemodRequest(response) {
	if (response) {
		const isEnabled = isValidResponse(response);
		sourcemodEnabledGauge.set(isEnabled ? Number(1) : Number(0));
	} else {
		sourcemodEnabledGauge.set((Number(-1)));
	}
}

async function getSourcepython(client) {
	return rconCommand(client, 'sp');
}

function sourcepythonRequest(response) {
	if (response) {
		const isEnabled = isValidResponse(response);
		sourcepythonEnabledGauge.set(isEnabled ? Number(1) : Number(0));
	} else {
		sourcepythonEnabledGauge.set(Number(-1));
	}
}

function isValidResponse(response) {
	return !response.includes('Unknown');
}

function gameRequest(response, game) {
	if (game === 'csgo') {
		status.set((Number(1)));
		cpu.set((Number(response[0])));
		netin.set((Number(response[1])));
		netout.set((Number(response[2])));
		uptime.set((Number(response[3])));
		maps.set((Number(response[4])));
		fps.set((Number(response[5])));
		players.set((Number(response[6])));
		svms.set((Number(response[7])));
		varms.set((Number(response[8])));
		tick.set((Number(response[9])));
	} else {
		status.set((Number(1)));
		cpu.set((Number(response[0])));
		netin.set((Number(response[1])));
		netout.set((Number(response[2])));
		uptime.set((Number(response[3])));
		maps.set((Number(response[4])));
		fps.set((Number(response[5])));
		players.set((Number(response[6])));
	}
}

async function getStats(client, game) {
	const stats = await rconCommand(client, 'stats');
	let statusLine = null;
	if (stats) {
		statusLine = stats.split(/\r?\n/);
	} else {
		return null;
	}
	if (game === 'csgo') {
		statusLine = stats.split(/\r?\n/);
		statusLine.pop();
	}
	statusLine.shift();
	statusLine = statusLine[0].split(/\s+/);
	return statusLine;
}
const csgoRegistry = new prometheus.Registry();
const gmodRegistry = new prometheus.Registry();
const cstrikeRegistry = new prometheus.Registry();

// Global metrics, used accross all Source gameservers
const status = new Gauge({ name: 'srcds_status', help: "The server's status, 0 = offline/bad password, 1 = online", registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const cpu = new Gauge({ name: 'srcds_cpu', help: 'Probably the priority level of the srcds executable from an operating system point of view (0 - No priority, 10 - biggest priority)', registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const netin = new Gauge({ name: 'srcds_netin', help: 'Incoming bandwidth, in kbps, received by the server', registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const netout = new Gauge({ name: 'srcds_netout', help: 'Incoming bandwidth, in kbps, sent by the server', registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const uptime = new Gauge({ name: 'srcds_uptime', help: "The server's uptime, in minutes", registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const maps = new Gauge({ name: 'srcds_maps', help: "The number of maps played on that server since it's start", registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const fps = new Gauge({ name: 'srcds_fps', help: "The server's tick (10 fps on idle, 64 fps for 64 ticks server, 128 fps for 128 ticks..)", registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });
const players = new Gauge({ name: 'srcds_players', help: 'The number of real players actually connected on the server', registers: [csgoRegistry, gmodRegistry, cstrikeRegistry] });

// CSGO metrics
const svms = new Gauge({ name: 'srcds_svms', help: 'ms per sim frame', registers: [csgoRegistry] });
const varms = new Gauge({ name: 'srcds_varms', help: 'ms variance', registers: [csgoRegistry] });
const tick = new Gauge({ name: 'srcds_tick', help: 'The time in MS per tick', registers: [csgoRegistry] });

// Metamod metrics
const metamodEnabledGauge = new Gauge({ name: 'srcds_metamod_enabled', help: 'Is metamod enabled', registers: [csgoRegistry] });

// Sourcemod metrics
const sourcemodEnabledGauge = new Gauge({ name: 'srcds_sourcemod_enabled', help: 'Is sourcemod enabled', registers: [csgoRegistry] });

// SourcePython metrics
const sourcepythonEnabledGauge = new Gauge({ name: 'srcds_sourcepython_enabled', help: 'Is sourcepython enabled', registers: [csgoRegistry] });

app.get('/', (req, res) => {
	res.send('use /metrics?ip=&lt;srcds ip&gt;&port=&lt;srcds port&gt;&password=&lt;rcon password&gt;&game=&lt;game&gt;&sm=&ltboolean&gt&meta=&ltboolean&gtsp=&ltboolean&gt to get data');
});

app.get('/metrics', async (req, res) => {
	const { ip } = req.query;
	const { port } = req.query;
	const { password } = req.query;
	const { game } = req.query;
	const metamod = req.query.metamod || false;
	const sourcemod = req.query.sourcemod || false;
	const sourcepython = req.query.sourcepython || false;

	if (ip == null || port == null || password == null || game == null) {
		res.send('Missing parameter, either IP, port, RCON password or game<br />use /metrics?ip=&lt;srcds ip&gt;&port=&lt;srcds port&gt;&password=&lt;rcon password&gt;&game=&lt;game&gt;&sm=<boolean>&meta=<boolean>sp=<boolean> to get data');
		return;
	}

	if (game !== 'csgo' && game !== 'gmod' && game !== 'cstrike') {
		res.send('Incorrect game value, currently supported games are : csgo, gmod, cstrike');
		return;
	}

	const client = await connect(ip, port, password, 5000);
	const statsResponse = await getStats(client, game);
	try {
		if (metamod) {
			const metamodResponse = await getMetamod(client);
			metamodRequest(metamodResponse);
		} else {
			metamodRequest(null);
		}
		if (sourcemod) {
			const sourcemodResponse = await getSourcemod(client);
			sourcemodRequest(sourcemodResponse);
		} else {
			sourcemodRequest(null);
		}
		if (sourcepython) {
			const sourcepythonResponse = await getSourcepython(client);
			sourcepythonRequest(sourcepythonResponse);
		} else {
			sourcepythonRequest(null);
		}

		const defaultLabels = { server: `${ip}:${port}`, game };
		gameRequest(statsResponse, game);
		if (game === 'csgo') {
			csgoRegistry.setDefaultLabels(defaultLabels);
			res.end(csgoRegistry.metrics());
		} else if (game === 'cstrike') {
			cstrikeRegistry.setDefaultLabels(defaultLabels);
			res.end(cstrikeRegistry.metrics());
		} else if (game === 'gmod') {
			gmodRegistry.setDefaultLabels(defaultLabels);
			res.end(gmodRegistry.metrics());
		}
	} catch (e) {
		status.set((Number(0)));
		cpu.set((Number(0)));
		netin.set((Number(0)));
		netout.set((Number(0)));
		uptime.set((Number(0)));
		maps.set((Number(0)));
		fps.set((Number(0)));
		players.set((Number(0)));
		svms.set((Number(0)));
		varms.set((Number(0)));
		tick.set((Number(0)));
		metamodEnabledGauge.set((Number(-1)));
		sourcemodEnabledGauge.set((Number(-1)));
		sourcepythonEnabledGauge.set((Number(-1)));

		if (game === 'csgo') {
			res.end(csgoRegistry.metrics());
		} else if (game === 'gmod') {
			res.end(gmodRegistry.metrics());
		} else if (game === 'cstrike') {
			res.end(cstrikeRegistry.metrics());
		}
	}
	await client.disconnect();
});

app.listen(9591);
