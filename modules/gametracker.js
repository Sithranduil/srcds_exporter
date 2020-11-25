import utils from '../utils/utils.js';
import metrics from './metrics.js';

export default {
	async request(ip, port) {
		const dom = await utils.requestGameTracker(ip, port);
		const htmlDivElement = dom.window.document.querySelector('.block630_content_left');
		let rankLine = utils.searchLine(htmlDivElement.textContent, 'Percentile');
		rankLine = rankLine[0].trim();
		const rankRegex = RegExp('^(\\d+)');
		const rank = rankRegex.exec(rankLine)[0];
		return {
			rank,
		};
	},
	setMetrics(response) {
		const rank = response ? response.rank : 0;
		metrics.gametrackerRank.set((Number(rank)));
	},
};
