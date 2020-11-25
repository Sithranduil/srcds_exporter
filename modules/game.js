import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async requestStatus(client, game) {
		const stats = await utils.rconCommand(client, 'status');
		let statusLine = null;
		let res = null;
		if (stats) {
			statusLine = stats.split(/\r?\n/);
		} else {
			return null;
		}
		statusLine.shift();
		statusLine.shift();
		statusLine.shift();
		statusLine.shift();
		statusLine.shift();
		statusLine.shift();
		if (game === 'csgo') {
			if (statusLine[0].search('gotv') !== -1) {
				statusLine.shift();
			}
			res = statusLine[0].split(/players : (\d+) humans, (\d+) bots \((\d+)\/0 max\)/);
		} else {
			res = statusLine[0].split(/players : (\d+) humans, (\d+) bots \((\d+) max\)/);
		}
		res.pop();
		res.shift();
		return res;
	},
	setStatusMetrics(response) {
		let players = 0;
		let bots = 0;
		let maxPlayers = 0;
		if (response) {
			[players, bots, maxPlayers] = response;
		}
		metrics.players.set((Number(players)));
		metrics.bots.set((Number(bots)));
		metrics.maxPlayers.set((Number(maxPlayers)));
	},
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
		let svms = 0;
		let varms = 0;
		if (response) {
			status = 1;
			[cpu, netin, netout, uptime, maps, fps, , svms, varms] = response;
		}
		if (game === 'csgo') {
			metrics.status.set((Number(status)));
			metrics.cpu.set((Number(cpu)));
			metrics.netin.set((Number(netin)));
			metrics.netout.set((Number(netout)));
			metrics.uptime.set((Number(uptime)));
			metrics.maps.set((Number(maps)));
			metrics.fps.set((Number(fps)));
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
		if (response && response.sv_maxupdaterate) {
			maxUpdateRate = utils.parseCvar(response.sv_maxupdaterate).value;
		}
		metrics.svMaxUpdateRate.set((Number(maxUpdateRate)));
		return true;
	},
};
