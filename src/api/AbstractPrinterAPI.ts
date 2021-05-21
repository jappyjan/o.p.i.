import {ref} from 'vue';

export interface ITemp {
    label: string;
    target: number;
    actual: number;
}

export abstract class AbstractPrinterAPI {
    public readonly isPaused = ref(false);
    public readonly progress = ref(0);
    public readonly webUIUrl = ref('');
    public readonly currentJobName = ref('');
    public readonly temps = ref<ITemp[]>([]);
    public readonly eta = ref<number>(0)
    public readonly duration = ref<number>(0)

    public init(): Promise<void> {
        return Promise.reject('Not Implemented');
    }

    public pause(): Promise<void> {
        return Promise.reject('Not Implemented');
    }

    public resume(): Promise<void> {
        return Promise.reject('Not Implemented');
    }

    public cancel(): Promise<void> {
        return Promise.reject('Not Implemented');
    }
}
