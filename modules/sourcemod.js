import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async request(client) {
		return utils.rconCommand(client, 'sm version');
	},
	setMetrics(response) {
		if (response) {
			const isEnabled = utils.isValidResponse(response);
			const value = isEnabled ? Number(1) : Number(0);
			metrics.sourcemodEnabled.set(value);
		} else {
			metrics.sourcemodEnabled.set((Number(-1)));
		}
	},
};
