import express from 'express';
import { connect } from 'working-rcon';
import module from './modules/index.js';

const app = express();

app.get('/', (req, res) => {
	res.send('use /metrics?ip=&lt;srcds ip&gt;&port=&lt;srcds port&gt;&rconPassword=&lt;rcon password&gt;&game=&lt;game&gt;&sm=&ltboolean&gt&meta=&ltboolean&gtsp=&ltboolean&gt to get data');
});

app.get('/metrics', async (req, res) => {
	const config = {
		ip: req.query.ip,
		port: req.query.port,
		game: req.query.game,
		rconPassword: req.query.rconPassword,
	};
	config.metamod = req.query.metamod === 'true' || false;
	config.sourcemod = req.query.sourcemod === 'true' || false;
	config.sourcepython = req.query.sourcepython === 'true' || false;
	config.tags = req.query.tags || [];

	if (
		config.ip == null
		|| config.port == null
		|| config.rconPassword == null
		|| config.game == null
	) {
		res.send('Missing parameter');
		return;
	}

	if (!['csgo', 'cstrike', 'gmod'].includes(config.game)) {
		res.send('Incorrect game value, currently supported games are : csgo, gmod, cstrike');
		return;
	}

	try {
		const client = await connect(config.ip, config.port, config.rconPassword, 5000);
		const response = await module.request(config, client);
		await module.send(config, response, res);
		await client.disconnect();
	} catch (e) {
		if (e.code === 'EHOSTUNREACH') {
			console.error(`Unreachable host : ${e.address}:${e.port}`);
		} else {
			console.error(e);
		}
		// status.set((Number(0)));
		// cpu.set((Number(0)));
		// netin.set((Number(0)));
		// netout.set((Number(0)));
		// uptime.set((Number(0)));
		// maps.set((Number(0)));
		// fps.set((Number(0)));
		// players.set((Number(0)));
		// svms.set((Number(0)));
		// varms.set((Number(0)));
		// svMaxUpdateRate.set((Number(0)));
		// metamodEnabledGauge.set((Number(-1)));
		// sourcemodEnabledGauge.set((Number(-1)));
		// sourcepythonEnabledGauge.set((Number(-1)));
		// prepareData(ip, port, game, tags);
		// sendData(game, res);
	}
});

app.listen(9591);
