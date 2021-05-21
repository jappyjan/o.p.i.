import {createApp} from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/mdc-dark-indigo/theme.css';
import './styles/primevue.scss';
import {getI18n} from './i18n';
import ConfirmationService from 'primevue/confirmationservice';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(PrimeVue, {ripple: true});
app.use(ConfirmationService);
app.use(getI18n());

app.mount('#app');
