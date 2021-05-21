import {
    IPrinterConfig,
    PrinterConnectionType,
} from '@/store/IPrinterConfig';
import {MoonrakerAPI} from '@/api/MoonrakerAPI';
import {OctoprintAPI} from '@/api/OctoprintAPI';
import {Ref} from 'vue';
import {AbstractPrinterAPI} from '@/api/abstractPrinterAPI';
import {MoonrakerPrinterConfig} from '@/store/MoonrakerPrinterConfig';
import {OctoPrintPrinterConfig} from '@/store/OctoPrintPrinterConfig';

export class PrinterAPI implements Omit<AbstractPrinterAPI, 'init'>{
    public static instances: {[key: string]: AbstractPrinterAPI} = {};
    private instance: AbstractPrinterAPI;

    public get eta(): Ref {
        return this.instance.eta;
    }

    public get duration(): Ref {
        return this.instance.duration;
    }

    public get isPaused(): Ref {
        return this.instance.isPaused;
    }

    public get progress(): Ref {
        return this.instance.progress;
    }

    public get currentJobName(): Ref {
        return this.instance.currentJobName;
    }

    public get temps(): Ref {
        return this.instance.temps;
    }

    public get webUIUrl(): Ref {
        return this.instance.webUIUrl;
    }

    public pause(): Promise<void> {
        return this.instance.pause();
    }

    public resume(): Promise<void> {
        return this.instance.resume();
    }

    public cancel(): Promise<void> {
        return this.instance.cancel();
    }

    private constructor(instance: AbstractPrinterAPI) {
        this.instance = instance;
    }

    public static async get(config: IPrinterConfig): Promise<PrinterAPI> {
        const instance = PrinterAPI.makeInstance(config);

        await instance.init();
        return new PrinterAPI(instance);
    }

    private static makeInstance(config: IPrinterConfig): AbstractPrinterAPI {
        const instanceIdentifier = config.connectionType + '_' + config.uniqueIdentifier;
        if (this.instances[config.uniqueIdentifier]) {
            return this.instances[instanceIdentifier];
        }

        let instance: AbstractPrinterAPI;
        switch (config.connectionType) {
            case PrinterConnectionType.moonraker:
                instance = new MoonrakerAPI(config as MoonrakerPrinterConfig);
                break;

            case PrinterConnectionType.octoprint:
                instance = new OctoprintAPI(config as OctoPrintPrinterConfig);
                break;
        }

        this.instances[instanceIdentifier] = instance;
        return instance;
    }
}
