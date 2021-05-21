<template>
  <div class="p-grid">
    <div class="p-col"
         v-for="printer in printers"
         :key="printer.connectionType + '-' + printer.uniqueIdentifier"
    >
      <printer-preview-card :config="printer" />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {useStore} from 'vuex';
import {IPrinterConfig} from '@/store/IPrinterConfig';
import PrinterPreviewCard from '@/components/PrinterSelect/PrinterPreviewCard.vue';

export default defineComponent({
  name: 'PrinterSelect',
  components: {
    PrinterPreviewCard,
  },
  setup() {
    const store = useStore();

    const printers = store.state.printers as IPrinterConfig[];

    return {printers};
  },
});
</script>
