import { Gauge } from 'prom-client';
import registry from './registry.js';

export default {
	// Global metrics, used accross all Source gameservers
	status: new Gauge({ name: 'srcds_status', help: "The server's status, 0 = offline/bad password, 1 = online", registers: registry.allGameMetrics }),
	cpu: new Gauge({ name: 'srcds_cpu', help: 'Probably the priority level of the srcds executable from an operating system point of view (0 - No priority, 10 - biggest priority)', registers: registry.allGameMetrics }),
	netin: new Gauge({ name: 'srcds_netin', help: 'Incoming bandwidth, in kbps, received by the server', registers: registry.allGameMetrics }),
	netout: new Gauge({ name: 'srcds_netout', help: 'Incoming bandwidth, in kbps, sent by the server', registers: registry.allGameMetrics }),
	uptime: new Gauge({ name: 'srcds_uptime', help: "The server's uptime, in minutes", registers: registry.allGameMetrics }),
	maps: new Gauge({ name: 'srcds_maps', help: "The number of maps played on that server since it's start", registers: registry.allGameMetrics }),
	fps: new Gauge({ name: 'srcds_fps', help: "The server's tick (10 fps on idle, 64 fps for 64 ticks server, 128 fps for 128 ticks..)", registers: registry.allGameMetrics }),
	players: new Gauge({ name: 'srcds_players', help: 'The number of real players actually connected on the server', registers: registry.allGameMetrics }),
	bots: new Gauge({ name: 'srcds_bots', help: 'The number of bots actually connected on the server', registers: registry.allGameMetrics }),
	maxPlayers: new Gauge({ name: 'srcds_max_players', help: 'The number of real players actually connected on the server', registers: registry.allGameMetrics }),
	svMaxUpdateRate: new Gauge({ name: 'srcds_sv_max_update_rate', help: 'The time in MS per tick', registers: registry.allGameMetrics }),
	// Metamod metrics
	metamodEnabled: new Gauge({ name: 'srcds_metamod_enabled', help: 'Is metamod enabled', registers: registry.allGameMetrics }),
	// Sourcemod metrics
	sourcemodEnabled: new Gauge({ name: 'srcds_sourcemod_enabled', help: 'Is sourcemod enabled', registers: registry.allGameMetrics }),
	// SourcePython metrics
	sourcepythonEnabled: new Gauge({ name: 'srcds_sourcepython_enabled', help: 'Is sourcepython enabled', registers: registry.allGameMetrics }),
	// gametracker metrics
	gametrackerRank: new Gauge({ name: 'srcds_gametracker_rank', help: 'The rank from gametracker', registers: registry.allGameMetrics }),

	// CSGO metrics
	svms: new Gauge({ name: 'srcds_svms', help: 'ms per sim frame', registers: [registry.csgoRegistry] }),
	varms: new Gauge({ name: 'srcds_varms', help: 'ms variance', registers: [registry.csgoRegistry] }),
};
