<script lang="ts" setup>
import type { CollapseProps } from 'ant-design-vue'

// Props
defineProps({
  syllabusData: {
    type: Array<any>,
    required: true,
  },
})

const activeKey = ref(['1'])
const expandIconPosition = ref<CollapseProps['expandIconPosition']>('start')

// function handleClick(event: MouseEvent) {
//   // If you don't want click extra trigger collapse, you can prevent this:
//   event.stopPropagation()
// }
// watch(activeKey, (val) => {
//   // console.log(val)
// })
</script>

<template>
  <a-collapse v-model:active-key="activeKey" :expand-icon-position="expandIconPosition">
    <a-collapse-panel v-for="item in syllabusData" :key="item.id" :header="item.title">
      <p>{{ item.content }}</p>
      <template #extra>
        <div class="flex items-center gap-2 text-gray-700 text-xs mt-1">
          <span>{{ item.lesson }} Lessons</span>
          <span>{{ item.hour }} Hour</span>
        </div>
      </template>
    </a-collapse-panel>
  </a-collapse>
</template>
