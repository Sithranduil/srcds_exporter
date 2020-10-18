import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async requestStats(client, game) {
		const stats = await utils.rconCommand(client, 'stats');
		let statusLine = null;
		if (stats) {
			statusLine = stats.split(/\r?\n/);
		} else {
			return null;
		}
		if (game === 'csgo') {
			statusLine = stats.split(/\r?\n/);
			statusLine.shift();
			statusLine = statusLine[0].split(/\s+/);
			statusLine.shift();
			return statusLine;
		}
		statusLine.shift();
		statusLine = statusLine[0].split(/\s+/);
		return statusLine;
	},
	setStatsMetrics(response, game) {
		if (game === 'csgo') {
			metrics.status.set((Number(1)));
			metrics.cpu.set((Number(response[0])));
			metrics.netin.set((Number(response[1])));
			metrics.netout.set((Number(response[2])));
			metrics.uptime.set((Number(response[3])));
			metrics.maps.set((Number(response[4])));
			metrics.fps.set((Number(response[5])));
			metrics.players.set((Number(response[6])));
			metrics.svms.set((Number(response[7])));
			metrics.varms.set((Number(response[8])));
		} else {
			metrics.status.set((Number(1)));
			metrics.cpu.set((Number(response[0])));
			metrics.netin.set((Number(response[1])));
			metrics.netout.set((Number(response[2])));
			metrics.uptime.set((Number(response[3])));
			metrics.maps.set((Number(response[4])));
			metrics.fps.set((Number(response[5])));
			metrics.players.set((Number(response[6])));
		}
	},
	async requeseInfo(client, game) {
		const maxUpdateRate = await utils.rconCommand(client, 'sv_maxupdaterate');
		return {
			sv_maxupdaterate: maxUpdateRate,
		};
	},
	setInfoMetrics(response) {
		const maxUpdateRate = utils.parseCvar(response.sv_maxupdaterate);
		metrics.svMaxUpdateRate.set((Number(maxUpdateRate.value)));
		return true;
	},
};
