import Axios from 'axios';
import {AbstractPrinterAPI} from './AbstractPrinterAPI';
import {MoonrakerPrinterConfig} from '@/store/MoonrakerPrinterConfig';

interface IMoonrakerStatusUpdate {
    virtual_sdcard: {
        progress: number;
    };
    heater_bed: {
        temperature: number,
        target: number,
    };
    extruder: {
        temperature: number,
        target: number,
    };
    extruder1: {
        temperature: number,
        target: number,
    };
    extruder2: {
        temperature: number,
        target: number,
    };
    extruder3: {
        temperature: number,
        target: number,
    };
    extruder4: {
        temperature: number,
        target: number,
    };
    extruder5: {
        temperature: number,
        target: number,
    };
    print_stats: {
        state: 'standby' | 'printing' | 'paused' | 'complete' | 'error',
        filename: string,
        message: string,
        print_duration: number,
    },
    display_status: {
        progress: number,
    }
}

export class MoonrakerAPI extends AbstractPrinterAPI {
    private readonly config: MoonrakerPrinterConfig;
    private socket!: WebSocket;
    private static _lastMoonrakerRequestIndex = 1;

    private static nextRequestIndex() {
        MoonrakerAPI._lastMoonrakerRequestIndex++;
        return MoonrakerAPI._lastMoonrakerRequestIndex;
    }

    public constructor(config: MoonrakerPrinterConfig) {
        super();

        this.config = config;
        this.webUIUrl.value = `${config.host}:${config.port}`;
    }

    private async getOneShotApiToken(): Promise<string> {
        const response = await Axios.get<{ result: string }>(`${this.config.host}:${this.config.port}/access/oneshot_token`);
        return response.data.result;
    }

    private async initWebSocket() {
        const token = await this.getOneShotApiToken();

        const host = this.config.host
            .replace('https://', '')
            .replace('http://', '');

        this.socket = new WebSocket(`ws://${host}:${this.config.port}/websocket?token=${token}`);

        await new Promise<void>((resolve) => {
            this.socket.addEventListener('open', () => resolve());
        });

        const subscriptionObjects: { [key: string]: null | string[] } = {
            'virtual_sdcard': null,
            'heater_bed': null,
            'print_stats': null,
            'display_status': null,
        };
        for (let extruderIndex = 0; extruderIndex < this.config.toolCount; extruderIndex++) {
            subscriptionObjects['extruder' + (extruderIndex > 0 ? extruderIndex : '')] = ['temperature', 'target'];
        }
        const subscriptionId = MoonrakerAPI.nextRequestIndex();
        this.socket.send(JSON.stringify({
            'jsonrpc': '2.0',
            'method': 'printer.objects.subscribe',
            'params': {
                'objects': subscriptionObjects,
            },
            'id': subscriptionId,
        }));

        this.socket.addEventListener('message', (e) => {
            const data = JSON.parse(e.data);

            if (data.method === 'notify_status_update') {
                this.onMoonrakerStatusUpdate(data.params[0]);
                return;
            }

            if (data.id === subscriptionId) {
                this.onMoonrakerStatusUpdate(data.result.status);
                return;
            }
        });

        // this.socket.addEventListener('close', (e) => console.log('moon-close', e));
        // this.socket.addEventListener('error', (e) => console.log('moon-error', e));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onMoonrakerStatusUpdate(status: IMoonrakerStatusUpdate) {
        if (status.heater_bed) {
            this.updateHeaterBed(status.heater_bed);
        }

        if (status.heater_bed) {
            this.updateHeaterBed(status.heater_bed);
        }

        if (status.virtual_sdcard) {
            this.progress.value = status.virtual_sdcard.progress * 100;
        }

        if (status.print_stats) {
            if (status.print_stats.filename !== undefined) {
                this.currentJobName.value = status.print_stats.filename;
            }
            if (status.print_stats.state !== undefined) {
                this.isPaused.value = status.print_stats.state === 'paused';
            }
        }

        this.updateEtaAndDuration(status);

        Object.keys(status).forEach(key => {
            if (key.startsWith('extruder')) {
                this.updateExtruderTemps(key, status[key as 'extruder1']);
                return;
            }
        });
    }

    private updateEtaAndDuration(status: IMoonrakerStatusUpdate) {
        if (
            !status.print_stats || !status.print_stats.print_duration ||
            !status.display_status || !status.display_status.progress
        ) {
            return;
        }

        this.duration.value = status.print_stats.print_duration;

        if (status.display_status.progress <= 0) {
            this.eta.value = 0;
            return;
        }

        this.eta.value = status.print_stats.print_duration / status.display_status.progress - status.print_stats.print_duration;
    }

    private updateHeaterBed(bed: { temperature: number, target: number }) {
        const existingIndex = this.temps.value.findIndex(temp => temp.label === 'heater_bed');

        if (existingIndex === -1) {
            this.temps.value.push({
                label: 'heater_bed',
                target: bed.target || 0,
                actual: bed.temperature || 0,
            });
        } else {
            this.temps.value[existingIndex].target = bed.target || this.temps.value[existingIndex].target;
            this.temps.value[existingIndex].actual = bed.temperature || this.temps.value[existingIndex].actual;
            this.temps.value = JSON.parse(JSON.stringify(this.temps.value));
        }
    }

    private updateExtruderTemps(label: string, extruder: { temperature: number, target: number }) {
        const existingIndex = this.temps.value.findIndex(temp => temp.label === label);

        if (existingIndex === -1) {
            this.temps.value.push({
                label,
                target: extruder.target || 0,
                actual: extruder.temperature || 0,
            });
        } else {
            this.temps.value[existingIndex].target = extruder.target || this.temps.value[existingIndex].target;
            this.temps.value[existingIndex].actual = extruder.temperature || this.temps.value[existingIndex].actual;
            this.temps.value = JSON.parse(JSON.stringify(this.temps.value));
        }
    }

    public async init(): Promise<void> {
        await this.initWebSocket();
        return Promise.resolve(undefined);
    }

    public async pause(): Promise<void> {
        this.socket.send(JSON.stringify({
            'jsonrpc': '2.0',
            'method': 'printer.print.pause',
            'id': MoonrakerAPI.nextRequestIndex(),
        }));
    }

    public async resume(): Promise<void> {
        this.socket.send(JSON.stringify({
            'jsonrpc': '2.0',
            'method': 'printer.print.resume',
            'id': MoonrakerAPI.nextRequestIndex(),
        }));
    }

    public async cancel(): Promise<void> {
        this.socket.send(JSON.stringify({
            'jsonrpc': '2.0',
            'method': 'printer.print.cancel',
            'id': MoonrakerAPI.nextRequestIndex(),
        }));
    }
}
