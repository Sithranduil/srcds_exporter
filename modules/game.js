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
		let status = 0;
		let cpu = 0;
		let netin = 0;
		let netout = 0;
		let uptime = 0;
		let maps = 0;
		let fps = 0;
		let players = 0;
		let svms = 0;
		let varms = 0;
		if (response) {
			status = 1;
			[cpu, netin, netout, uptime, maps, fps, players, svms, varms] = response;
		}
		if (game === 'csgo') {
			metrics.status.set((Number(status)));
			metrics.cpu.set((Number(cpu)));
			metrics.netin.set((Number(netin)));
			metrics.netout.set((Number(netout)));
			metrics.uptime.set((Number(uptime)));
			metrics.maps.set((Number(maps)));
			metrics.fps.set((Number(fps)));
			metrics.players.set((Number(players)));
			metrics.svms.set((Number(svms)));
			metrics.varms.set((Number(varms)));
		} else {
			metrics.status.set((Number(status)));
			metrics.cpu.set((Number(cpu)));
			metrics.netin.set((Number(netin)));
			metrics.netout.set((Number(netout)));
			metrics.uptime.set((Number(uptime)));
			metrics.maps.set((Number(maps)));
			metrics.fps.set((Number(fps)));
			metrics.players.set((Number(players)));
		}
	},
	async requeseInfo(client) {
		const maxUpdateRate = await utils.rconCommand(client, 'sv_maxupdaterate');
		return {
			sv_maxupdaterate: maxUpdateRate,
		};
	},
	setInfoMetrics(response) {
		let maxUpdateRate = 0;
		if (response) {
			maxUpdateRate = utils.parseCvar(response.sv_maxupdaterate).value;
		}
		metrics.svMaxUpdateRate.set((Number(maxUpdateRate)));
		return true;
	},
};
