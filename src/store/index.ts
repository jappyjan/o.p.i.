import {createStore} from 'vuex';
import {IPrinterConfig} from '@/store/IPrinterConfig';
import VuexPersistence from 'vuex-persist';

const vuexLocal = new VuexPersistence<RootState>({
    storage: window.localStorage
});

class RootState {
    public printers: IPrinterConfig[] = [];
}

export default createStore({
    state: new RootState(),
    mutations: {
        addPrinter(state, config: IPrinterConfig) {
            state.printers.push(config);
        },
        removePrinter(state, index: number) {
            state.printers = state.printers.filter((_, printerIndex) => printerIndex !== index);
        }
    },
    actions: {},
    modules: {},
    plugins: [vuexLocal.plugin],
});
