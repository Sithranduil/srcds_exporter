import { TimeoutError } from 'working-rcon';
import got from 'got';
import jsdom from 'jsdom';

export default {
	parseCvar(value) {
		const cvar = this.getLine(value);
		const cvarRegex = RegExp('^\\"(.*)\\" = \\"([^\\"]*)\\"(.*)$');
		const res = cvarRegex.exec(cvar);
		return {
			name: res[1],
			value: res[2],
			extra: res[3],
		};
	},
	getLine(value, line = 1) {
		return value.split('\n', line)[line - 1];
	},
	searchLine(value, stringToSearch) {
		const lines = value.split('\n');
		return lines.filter((line) => line.includes(stringToSearch));
	},
	async rconCommand(client, command) {
		try {
			return client.command(command);
		} catch (err) {
			if (err instanceof TimeoutError) {
				console.error('request timed out');
			} else {
				throw err;
			}
		}
		return null;
	},
	isValidResponse(response) {
		return !response.includes('Unknown');
	},
	async requestGameTracker(ip, port) {
		const response = await got(`https://www.gametracker.com/server_info/${ip}:${port}`);
		return new jsdom.JSDOM(response.body);
	},
};
