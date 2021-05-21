export enum PrinterConnectionType {
    octoprint = 'octoprint',
    moonraker = 'moonraker',
}

export interface IPrinterConfig {
    uniqueIdentifier: string;
    name: string;
    connectionType: PrinterConnectionType;
    cameraUrl: string | null;
}
