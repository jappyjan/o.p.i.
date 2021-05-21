interface IOctoPrintClientOpts {
    apikey: string;
    baseurl: string;
}

interface IJob {
    job: {
        'file': {
            'name': string,
            'origin': string,
            'size': number,
            'date': number
        },
        'estimatedPrintTime': number,
        'filament': {
            'tool0': {
                'length': number,
                'volume': number
            }
        }
    },
    'progress': {
        'completion': number,
        'filepos': number,
        'printTime': number,
        'printTimeLeft': number
    },
    'state': string | 'Operational' | 'Printing' | 'Pausing' | 'Paused' | 'Cancelling' | 'Error' | 'Offline' | 'Offline after error' | 'Opening serial connection',
    error?: string
}

export type OctoPrintClientInstantiatable = { new(opts: IOctoPrintClientOpts): IOctoPrintClient }

export interface ISocketMessagePayloadCurrentStateTemps {
    [key: string]: {
        'actual': number | null,
        'target': number | null
    },
}

export interface ISocketMessagePayloadCurrentState {
    'state': {
        'text': string,
        'flags': {
            'operational': boolean,
            'printing': boolean,
            'cancelling': boolean,
            'pausing': boolean,
            'resuming': boolean,
            'finishing': boolean,
            'closedOrError': boolean,
            'error': boolean,
            'paused': boolean,
            'ready': boolean,
            'sdReady': boolean
        },
        'error': string
    },
    'job': {
        'file': {
            'name': string,
            'path': string,
            'display': string,
            'origin': string,
            'size': number,
            'date': number
        },
        'estimatedPrintTime': null | number,
        'averagePrintTime': null | number,
        'lastPrintTime': null | number,
        'filament': null | number,
        'user': string
    },
    'currentZ': number,
    'progress': {
        'completion': number,
        'filepos': number,
        'printTime': number,
        'printTimeLeft': number,
        'printTimeLeftOrigin': string
    },
    'resends': {
        'count': number,
        'transmitted': number,
        'ratio': number
    },
    'serverTime': number,
    'temps': [ISocketMessagePayloadCurrentStateTemps],
    'logs': string[],
    'messages': string[],
    'busyFiles': Array<{
        'origin': string,
        'path': string
    }>
}

export interface IOctoPrintClient {
    job: {
        get: () => Promise<IJob>;
        pause: () => Promise<void>;
        resume: () => Promise<void>;
        cancel: () => Promise<void>;
    },
    browser: {
        passiveLogin: () => {
            done: (cb: (res: { name: string, session: string }) => void) => void;
        }
    },
    socket: {
        connect: () => void;
        reconnect: () => void;
        disconnect: () => void;
        onMessage: (messageType: string, handler: (e: { event: unknown, data: unknown }) => void) => void;
        sendAuth: (name: string, session: string) => void;
    }
}
