import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async request(client) {
		return utils.rconCommand(client, 'meta version');
	},
	setMetrics(response) {
		if (response) {
			const isEnabled = utils.isValidResponse(response);
			const value = isEnabled ? Number(1) : Number(0);
			metrics.metamodEnabled.set(value);
		} else {
			metrics.metamodEnabled.set((Number(-1)));
		}
	},
};
