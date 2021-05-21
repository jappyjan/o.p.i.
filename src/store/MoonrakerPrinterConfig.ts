import {IPrinterConfig, PrinterConnectionType} from '@/store/IPrinterConfig';

interface IMoonrakerOptions {
    name?: string;
    host: string;
    port?: number;
    apiKey: string;
    toolCount?: number;
}

export class MoonrakerPrinterConfig implements IPrinterConfig {
    public readonly uniqueIdentifier: string;
    public readonly name: string;
    public readonly connectionType = PrinterConnectionType.moonraker;
    public cameraUrl: string | null;
    public readonly host: string;
    public readonly apiKey: string;
    public readonly port: number;
    public readonly toolCount: number;

    public constructor({name = 'Klipper', host, port = 80, apiKey, toolCount = 1}: IMoonrakerOptions) {
        this.name = name;
        this.uniqueIdentifier = host + ':' + port;
        this.host = host;
        this.port = port;
        this.apiKey = apiKey;
        this.toolCount = toolCount;
        this.cameraUrl = `${host}:${port}/webcam/?action=stream`;
    }
}
