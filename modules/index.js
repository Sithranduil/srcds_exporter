import metamod from './metamod.js';
import sourcemod from './sourcemod.js';
import sourcepython from './sourcepython.js';
import registry from './registry.js';
import game from './game.js';
import gametracker from './gametracker.js';

export default {
	async request(config, client) {
		let metamodResponse;
		let sourcemodResponse;
		let sourcepythonResponse;

		const infoResponse = await game.requeseInfo(client, config.game);
		const statsResponse = await game.requestStats(client, config.game);
		const statusResponse = await game.requestStatus(client, config.game);
		const gameTrackerResponse = await gametracker.request(config.ip, config.port);
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
			status: statusResponse,
			metamod: metamodResponse,
			sourcemod: sourcemodResponse,
			sourcepython: sourcepythonResponse,
			gametracker: gameTrackerResponse,
		};
	},

	async send(config, response, res) {
		metamod.setMetrics(response ? response.metamod : null);
		sourcemod.setMetrics(response ? response.sourcemod : null);
		sourcepython.setMetrics(response ? response.sourcepython : null);
		gametracker.setMetrics(response ? response.gametracker : null);
		game.setStatsMetrics(response ? response.stats : null, config.game);
		game.setInfoMetrics(response ? response.info : null);
		game.setStatusMetrics(response ? response.status : null);

		registry.setDefaultLabels(
			config.ip,
			config.port,
			config.game,
			config.tags,
			response ? response.metamod : null,
			response ? response.sourcemod : null,
			response ? response.sourcepython : null,
		);

		registry.sendMetrics(config.game, res);
	},
};
