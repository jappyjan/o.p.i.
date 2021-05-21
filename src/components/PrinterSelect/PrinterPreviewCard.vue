<template>
  <Card>
    <template #header v-if="config.cameraUrl">
      <div v-if="printer" style="position: absolute;">
        <div v-for="temp in printer.temps"
             :key="temp.label"
             style="margin: 8px; display: inline-block"
        >
          <Button type="button"
                  :label="temp.label"
                  :badge="getTempBadgeLabel(temp)"
                  class="p-button-sm p-button-rounded p-button-danger"
          />
        </div>
      </div>
      <img alt="user header" :src="config.cameraUrl">
    </template>

    <template #title>
      {{ config.name }}
    </template>

    <template #content>
      <div v-if="!printer && !error">
        <ProgressSpinner/>
        <span>{{ t('printer.connecting') }}</span>
      </div>
      lol
      <div v-if="printer">
        <div class="p-d-flex p-jc-between">
          <Knob :modelValue="Math.round(printer.progress)" readonly valueTemplate="{value}%">
            {{ t('printer.job.progress', {progress: printer.progress.toFixed(2)}) }}
          </Knob>
          <div>
            <div>{{ printer.currentJobName }}</div>
            <div class="p-d-flex p-jc-between">
              <span>{{ t('printer.job.durationLabel') }}</span>
              <span>{{secondsToDayHourMinuteSeconds(printer.duration)}}</span>
            </div>
            <div class="p-d-flex p-jc-between">
              <span>{{ t('printer.job.etaLabel') }}</span>
              <span>{{secondsToDayHourMinuteSeconds(printer.eta)}}</span>
            </div>
          </div>
        </div>
      </div>

      <Message v-if="error" severity="error" :closable="false">
        {{ t('printer.connectionError', {error: error.message}) }}
      </Message>
    </template>

    <template #footer v-if="printer">
      <div class="p-d-flex p-jc-between">
        <div class="p-buttonset" style="display: inline-block">
          <Button icon="pi pi-play" label="Resume" class="p-button-success" v-if="printer.isPaused"
                  @click="printer.resume()"/>
          <Button icon="pi pi-pause" label="Pause" class="p-button-secondary" v-else @click="printer.pause()"/>
          <Button icon="pi pi-times" label="Cancel" class="p-button-warning" @click="confirmCancelPrint()"/>
          <Button icon="pi pi-exclamation-triangle" label="E-Stop" class="p-button-danger"/>
        </div>

        <a :href="printer.webUIUrl" v-if="printer.webUIUrl" style="text-decoration: none" target="_blank">
          <Button icon="pi pi-external-link" label="Web-UI"/>
        </a>
      </div>
    </template>
  </Card>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Message from 'primevue/message';
import {PrinterAPI} from '@/api';
import {IPrinterConfig} from '@/store/IPrinterConfig';
import {useI18n} from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';
import {useConfirm} from 'primevue/useconfirm';
import {ITemp} from '@/api/AbstractPrinterAPI';
import Knob from 'primevue/knob';
import {secondsToDayHourMinuteSeconds} from '@/utils/dates';

export default defineComponent({
  name: 'PrinterPreviewCard',
  components: {
    Card,
    Button,
    Message,
    ProgressSpinner,
    Knob,
  },
  props: {
    config: Object,
  },
  setup(props) {
    const config = props.config as IPrinterConfig;
    const printerRef = ref<null | PrinterAPI>(null);
    const error = ref<null | Error>(null);
    const {t} = useI18n();

    PrinterAPI.get(config)
        .then((printer) => {
          printerRef.value = printer;
        })
        .catch(e => error.value = e);

    const confirm = useConfirm();
    const confirmCancelPrint = () => {
      confirm.require({
        message: t('printer.confirmCancelPrint'),
        header: t('confirm.header'),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (printerRef.value) {
            (printerRef.value as PrinterAPI).cancel();
          }
        },
      });
    };

    const getTempBadgeLabel = (temp: ITemp) => {
      const formatTemp = (degrees: number) => {
        if (!degrees) {
          degrees = 0;
        }
        return degrees.toFixed(0) + '°';
      };

      return `${formatTemp(temp.actual)}/${formatTemp(temp.target)}`;
    };

    return {
      printer: printerRef,
      error,
      t,
      confirmCancelPrint,
      getTempBadgeLabel,
      secondsToDayHourMinuteSeconds,
    };
  },
});
</script>
