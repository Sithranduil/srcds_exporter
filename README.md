# SRCDS Prometheus exporter

Works (or should work) with the following servers :
* CSGO
* CSS

## How to install

### Method 1 : Download sources and run

You need to have NodeJS installed if you want to run the sources, NVM (Node Version Manager) is a simple tool to get it running : https://github.com/nvm-sh/nvm

1. Download the repo (using git clone or direct zip download)
2. Enter the srcds_exporter directory and run `npm i`, this will install all required dependencies
3. Start the script with node : `node index.js`, you can create a service or run it in a screen to keep it active in background

### Method 2 : With docker

`docker run -d -p <external port>:9591 --name srcds_exporter sithranduil/srcds_exporter:latest`

## Configure srcds_exporter

You need to create your own configuration to allow the exporter to request gametracker, then mount it into the docker container.
You can find example file here : https://github.com/Sithranduil/srcds_exporter/blob/master/config.js

## Configure Prometheus

Add the following configuration to Prometheus static configuration :

```
- job_name: 'srcds'
    scrape_interval: 5s
    static_configs:
      # Format :  ["<ip>:<port>:<rcon_password>:<game>:<use_metamod:use_sourcemod:use_sourcepython>"]
      - targets: ["87.98.155.38:27016:password:cstrike:true:true:false"]
        labels:
          name: 'cstrike:only_de_dust2'
    relabel_configs:
      # IP
      - source_labels: [__address__]
        regex: ^(.+):\d+:\w+:\w+(:(\w+)){0,3}$
        replacement: "$1"
        target_label: __param_ip
      # port
      - source_labels: [__address__]
        regex: ^.+:(\d+):\w+:\w+(:(\w+)){0,3}$
        replacement: "$1"
        target_label: __param_port
      # rconPassword
      - source_labels: [__address__]
        regex: ^.+:\d+:(\w+):\w+(:(\w+)){0,3}$
        replacement: "$1"
        target_label: __param_rconPassword
      # game
      - source_labels: [__address__]
        regex: ^.+:\d+:\w+:(\w+)(:(\w+)){0,3}$
        replacement: "$1"
        target_label: __param_game
      # metamod
      - source_labels: [__address__]
        regex: ^.+:\d+:\w+:\w+:(\w+).*$
        replacement: "$1"
        target_label: __param_metamod
      # sourcemod
      - source_labels: [__address__]
        regex: ^.+:\d+:\w+:\w+:(\w+):(\w+).*$
        replacement: "$2"
        target_label: __param_sourcemod
      # sourcepython
      - source_labels: [__address__]
        regex: ^.+:\d+:\w+:\w+:(\w+):(\w+):(\w+).*$
        replacement: "$3"
        target_label: __param_sourcepython
      - source_labels: [__address__]
        target_label: instance
      - target_label: __address__
        replacement: srcds-exporter:9591 # Real exporter's IP:Port
```

Values for `game` field :

| Game   |      Value      |
|:----------:|:-------------:|
| CS:GO |  csgo |
| Counter Strike Source | cstrike |

## How to access

If you want to see what the exporter returns, you can access :
 
 `http://<ip>:9591/metrics?ip=<srcds ip>&port=<srcds port>&password=<rcon password>&game=<game>&metamod=<metamod>&sourcepython=<sourcepython>&sourcemod=<sourcemod>`
 
## Grafana dashboard

Is there a Grafana dashboard available ? Of course!

**CSGO/CSS** : https://grafana.com/grafana/dashboards/13312
