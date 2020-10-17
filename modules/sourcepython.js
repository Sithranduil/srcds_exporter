import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async request(client) {
		return utils.rconCommand(client, 'sp info');
	},
	setMetrics(response) {
		if (response) {
			const isEnabled = utils.isValidResponse(response);
			const value = isEnabled ? Number(1) : Number(0);
			metrics.sourcepythonEnabled.set(value);
		} else {
			metrics.sourcepythonEnabled.set(Number(-1));
		}
	},
};
