import {
    IOctoPrintClient,
    ISocketMessagePayloadCurrentState,
    ISocketMessagePayloadCurrentStateTemps,
    OctoPrintClientInstantiatable,
} from './IOctoPrintClient';
import {AbstractPrinterAPI, ITemp} from './AbstractPrinterAPI';
import {OctoPrintPrinterConfig} from '@/store/OctoPrintPrinterConfig';

function loadScript(url: string): Promise<void> {
    const scriptEl = document.createElement('script');
    scriptEl.src = url;

    return new Promise<void>((resolve) => {
        scriptEl.addEventListener('load', () => resolve());
        document.head.appendChild(scriptEl);
    });
}

export class OctoprintAPI extends AbstractPrinterAPI {
    private client!: IOctoPrintClient;
    private readonly apiKey: string;
    private readonly host: string;
    private readonly port: number;

    public constructor(config: OctoPrintPrinterConfig) {
        super();

        this.host = config.host;
        this.port = config.port;
        this.apiKey = config.apiKey;
        this.webUIUrl.value = `${config.host}:${config.port}`;
    }

    private async loadOctoprintClient(): Promise<OctoPrintClientInstantiatable> {
        if ((window as unknown as { OctoPrintClient: OctoPrintClientInstantiatable }).OctoPrintClient) {
            return Promise.resolve((window as unknown as { OctoPrintClient: OctoPrintClientInstantiatable }).OctoPrintClient);
        }

        const lodashUrl = `${this.host}:${this.port}/static/js/lib/lodash.min.js`;
        const jQueryUrl = `${this.host}:${this.port}/static/js/lib/jquery/jquery.min.js`;
        const sockJsUrl = `${this.host}:${this.port}/static/js/lib/sockjs.min.js`;
        const clientJSUrl = `${this.host}:${this.port}/static/webassets/packed_client.js`;

        await loadScript(lodashUrl);
        await loadScript(sockJsUrl);
        await loadScript(jQueryUrl);
        await loadScript(clientJSUrl);

        return (window as unknown as { OctoPrintClient: OctoPrintClientInstantiatable }).OctoPrintClient;
    }

    public async init(): Promise<void> {
        this.client = new (await this.loadOctoprintClient())({
            baseurl: `${this.host}:${this.port}`,
            apikey: this.apiKey,
        });

        this.client.socket.connect();

        await new Promise<void>((resolve) => {
            this.client.socket.onMessage('connected', () => {
                this.client.browser.passiveLogin().done(({name, session}) => {
                    this.client.socket.sendAuth(name, session);
                    resolve();
                });
            });
        });

        this.client.socket.onMessage('current', ({data}) => {
            this.onTelemetry(data as ISocketMessagePayloadCurrentState);
        });
    }

    private onTelemetry(telemetry: ISocketMessagePayloadCurrentState) {
        this.isPaused.value = telemetry.state.flags.paused;
        this.progress.value = telemetry.progress.completion;
        const temperatures = telemetry.temps[0];
        this.updateTemperatures(temperatures);
        this.currentJobName.value = telemetry.job.file.display;
    }

    private updateTemperatures(temperatures?: ISocketMessagePayloadCurrentStateTemps) {
        if (!temperatures) {
            return;
        }

        this.temps.value = Object.keys(temperatures).map((key) => {
            const keyOfTempObject = key as unknown as keyof ISocketMessagePayloadCurrentStateTemps;

            if (
                !temperatures[keyOfTempObject] ||
                !temperatures[keyOfTempObject]?.actual ||
                !temperatures[keyOfTempObject]?.target
            ) {
                return false;
            }

            return {
                label: keyOfTempObject,
                actual: temperatures[keyOfTempObject]!.actual as number,
                target: temperatures[keyOfTempObject]!.target as number,
            };
        }).filter((temp) => !!temp) as ITemp[];
    }

    public async pause(): Promise<void> {
        await this.client.job.pause();
    }

    public async resume(): Promise<void> {
        await this.client.job.resume();
    }

    public async cancel(): Promise<void> {
        await this.client.job.cancel();
    }
}
