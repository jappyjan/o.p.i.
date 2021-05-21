import {IPrinterConfig, PrinterConnectionType} from '@/store/IPrinterConfig';

interface IOctoPrintOptions {
    name: string;
    host: string;
    port?: number;
    apiKey: string;
}

export class OctoPrintPrinterConfig implements IPrinterConfig {
    public readonly uniqueIdentifier: string;
    public readonly name: string;
    public readonly connectionType = PrinterConnectionType.octoprint;
    public readonly cameraUrl: string | null;
    public readonly apiKey: string;
    public readonly host: string;
    public readonly port: number;

    public constructor({name, host, port = 80, apiKey}: IOctoPrintOptions) {
        this.name = name;
        this.uniqueIdentifier = host + ':' + port;
        this.host = host;
        this.port = port;
        this.apiKey = apiKey;
        this.cameraUrl = `${host}:${port}/webcam/?action=stream`;
    }
}
