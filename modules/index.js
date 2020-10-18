import metamod from './metamod.js';
import sourcemod from './sourcemod.js';
import sourcepython from './sourcepython.js';
import registry from './registry.js';
import game from './game.js';

export default {
	async request(config, client) {
		let metamodResponse;
		let sourcemodResponse;
		let sourcepythonResponse;

		const infoResponse = await game.requeseInfo(client, config.game);
		const statsResponse = await game.requestStats(client, config.game);
		if (config.metamod) {
			metamodResponse = await metamod.request(client);
		}
		if (config.sourcemod) {
			sourcemodResponse = await sourcemod.request(client);
		}
		if (config.sourcepython) {
			sourcepythonResponse = await sourcepython.request(client);
		}
		return {
			info: infoResponse,
			stats: statsResponse,
			metamod: metamodResponse,
			sourcemod: sourcemodResponse,
			sourcepython: sourcepythonResponse,
		};
	},

	async send(config, response, res) {
		metamod.setMetrics(response.metamod);
		sourcemod.setMetrics(response.sourcemod);
		sourcepython.setMetrics(response.sourcepython);
		game.setStatsMetrics(response.stats, config.game);
		game.setInfoMetrics(response.info);

		registry.setDefaultLabels(
			config.ip,
			config.port,
			config.game,
			config.tags,
			response.metamod,
			response.sourcemod,
			response.sourcepython,
		);

		registry.sendMetrics(config.game, res);
	},
};
