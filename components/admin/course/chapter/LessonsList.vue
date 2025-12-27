<script lang="ts" setup>
import type { DragChangeEvent } from 'vue-draggable-next'
import type { Lesson } from '~/types/course.type'
import { notification } from 'ant-design-vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
import { useCourseApi } from '~/composables/api/useCourseApi'

interface Props {
  listLesson: any
  chapterId: string
}

const props = defineProps<Props>()
const route = useRoute()
const courseId = computed(() => route.params.id as string)
const { t } = useI18n()
const { patchLesson } = useCourseApi()

const listLesson = ref(props.listLesson)

async function handleChange(e: DragChangeEvent<Lesson>) {
  if (e.moved) {
    const { newIndex, element } = e.moved
    try {
      // Get courseId from route
      const courseId = route.params.id as string
      // Create a partial payload with just the order field
      const orderPayload = { order: newIndex } as any
      await patchLesson(courseId, props.chapterId, element.id, orderPayload)

      notification.success({
        message: t('admin.chapterManagement.lessons.updateOrderSuccess'),
      })
    }
    catch (error) {
      console.error('Failed to update lesson order:', error)
      // Revert the change on error
      listLesson.value = [...props.listLesson]
      notification.error({
        message: t('admin.chapterManagement.lessons.updateOrderFailed'),
      })
    }
  }
}
</script>

<template>
  <div class="lesson">
    <div class="flex flex-col gap-3">
      <draggable
        v-model="listLesson" tag="transition-group" :component-data="{
          tag: 'div',
          type: 'transition',
          name: 'fade',
        }" :animation="200" group="people" item-key="id" @change="handleChange"
      >
        <!-- <div class="drag-item">
          {{ element.name }}
        </div> -->
        <NuxtLink
          v-for="item in listLesson" :key="item.id" :to="`/admin/courses/${courseId}/chapters/${props.chapterId}/lessons-${item.id}`"
          class="drag-item mt-4 flex items-center justify-between border border-gray-200 rounded-lg p-4 cursor-pointer"
        >
          <div class="flex items-center gap-2">
            <Icon name="i-material-symbols-light-play-circle-outline" class="text-2xl text-black" />
            <div class="flex flex-col">
              <h2 class="text-black font-semibold text-base !m-0">
                {{ item?.title }}
              </h2>
              <p class="!m-0 text-[#0A033C] text-xs !p-0">
                {{ t('admin.chapterManagement.lessons.time') }}: {{ item?.video_duration_formatted }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <a-button type="link">
              {{ t('admin.chapterManagement.lessons.edit') }}
            </a-button>
            <!-- <a-button class="!text-red-500" type="link">
            Delete
          </a-button> -->
          </div>
        </NuxtLink>
      </draggable>
    </div>
  </div>
</template>
