import prometheus from 'prom-client';
import utils from '../utils/utils.js';

const csgoRegistry = new prometheus.Registry();
const gmodRegistry = new prometheus.Registry();
const cstrikeRegistry = new prometheus.Registry();
const allGameMetrics = [
	csgoRegistry,
	gmodRegistry,
	cstrikeRegistry,
];

export default {
	csgoRegistry,
	gmodRegistry,
	cstrikeRegistry,
	allGameMetrics,

	setDefaultLabels(ip, port, game, tags, metamodResponse, sourcemodResponse, sourcepythonResponse) {
		const defaultLabels = { server: `${ip}:${port}`, game, tags };
		if (metamodResponse) {
			const line = utils.getLine(metamodResponse);
			const version = line.replace('Metamod:Source version ', '');
			defaultLabels.metamod = version;
		}
		if (sourcemodResponse) {
			const line = utils.getLine(sourcemodResponse, 2);
			const version = line.replace('    SourceMod Version: ', '');
			defaultLabels.sourcemod = version;
		}
		if (sourcepythonResponse) {
			const line = utils.getLine(sourcepythonResponse, 8);
			const version = line.replace('SP version    : ', '');
			defaultLabels.sourcepython = version;
		}
		if (game === 'csgo') {
			csgoRegistry.setDefaultLabels(defaultLabels);
		} else if (game === 'cstrike') {
			cstrikeRegistry.setDefaultLabels(defaultLabels);
		} else if (game === 'gmod') {
			gmodRegistry.setDefaultLabels(defaultLabels);
		}
	},

	sendMetrics(game, res) {
		if (game === 'csgo') {
			res.end(csgoRegistry.metrics());
		} else if (game === 'cstrike') {
			res.end(cstrikeRegistry.metrics());
		} else if (game === 'gmod') {
			res.end(gmodRegistry.metrics());
		}
	},
};
