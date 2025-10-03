<script lang="ts" setup>
import type { CollapseProps } from 'ant-design-vue'
import type { Chapter, Lesson } from '~/types/course.type'
import { notification } from 'ant-design-vue'

defineProps<{
  syllabusData: Chapter[]
}>()

const activeKey = ref(['1'])
const expandIconPosition = ref<CollapseProps['expandIconPosition']>('start')
const expandedLessonId = ref<string | null>(null)

function handleLessonClick(lesson: Lesson, event: MouseEvent) {
  event.stopPropagation()

  if (!lesson.is_unlocked) {
    notification.warning({
      message: 'Lesson Locked',
      description: 'This lesson is not available yet. Please complete previous lessons first.',
    })
    return
  }

  if (!lesson.is_published) {
    notification.info({
      message: 'Lesson Coming Soon',
      description: 'This lesson is being prepared and will be available soon.',
    })
    return
  }

  // Toggle inline player for published & unlocked lessons
  expandedLessonId.value = expandedLessonId.value === lesson.id ? null : lesson.id
}

function getChapterDuration(lessons: Lesson[]): string {
  const totalSeconds = lessons.reduce((total, lesson) => total + lesson.video_duration, 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  return `${minutes}m`
}
</script>

<template>
  <a-collapse
    v-model:active-key="activeKey"
    :expand-icon-position="expandIconPosition"
    class="border border-gray-200 rounded-lg overflow-hidden syllabus"
  >
    <a-collapse-panel
      v-for="(chapter, index) in syllabusData"
      :key="chapter.id"
      :header="chapter.title"
      class="border-b border-gray-100 last:border-b-0"
    >
      <!-- Chapter Description -->
      <div v-if="chapter.description" class="mb-4 text-gray-600 text-sm">
        {{ chapter.description }}
      </div>

      <!-- Lessons List -->
      <div class="space-y-2">
        <div
          v-for="(lesson, lessonIndex) in chapter.lessons"
          :key="lesson.id"
          class="transition-all duration-200"
          :class="{
            'opacity-60 cursor-not-allowed': !lesson.is_unlocked,
            'hover:transform hover:translate-x-1': lesson.is_unlocked,
          }"
          @click="handleLessonClick(lesson, $event)"
        >
          <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <!-- Lesson Info -->
            <div class="flex items-center gap-3 flex-1">
              <!-- Lesson Number -->
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                :class="{
                  'bg-blue-100 text-blue-600': lesson.is_unlocked,
                  'bg-gray-100 text-gray-400': !lesson.is_unlocked,
                }"
              >
                {{ lesson.order }}
              </div>

              <!-- Lesson Content -->
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 truncate">
                  {{ lesson.title }}
                </h4>
                <p v-if="lesson.description" class="text-sm text-gray-500 truncate">
                  {{ lesson.description }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs text-gray-500">{{ lesson.video_duration_formatted }}</span>
                  <a-tag v-if="lesson.is_preview" color="green" size="small">
                    Preview
                  </a-tag>
                  <a-tag v-if="!lesson.is_published" color="orange" size="small">
                    Coming Soon
                  </a-tag>
                  <a-tag v-if="!lesson.is_unlocked" color="red" size="small">
                    Locked
                  </a-tag>
                </div>
              </div>
            </div>

            <!-- Lesson Actions -->
            <div class="flex items-center gap-2">
              <!-- Play Button -->
              <a-button
                v-if="lesson.is_unlocked && lesson.is_published"
                type="primary"
                size="small"
                shape="circle"
                class="shadow-sm hover:shadow-md transition-shadow !flex !items-center !justify-center"
              >
                <Icon name="i-solar-play-outline" class="text-[15px]" />
              </a-button>

              <!-- Lock Icon -->
              <Icon
                v-else-if="!lesson.is_unlocked"
                name="i-solar-lock-outline"
                class="text-gray-400 text-lg"
              />

              <!-- Clock Icon -->
              <Icon
                v-else-if="!lesson.is_published"
                name="i-solar-clock-circle-outline"
                class="text-orange-400 text-lg"
              />
            </div>
          </div>

          <!-- Inline Player Area -->
          <div
            v-if="expandedLessonId === lesson.id"
            class="mt-3 rounded-lg border border-gray-200 p-3 bg-gray-50"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="i-solar-video-library-outline" class="text-base" />
                <span>Preview Player</span>
              </div>
              <a-button size="small" @click.stop="expandedLessonId = null">
                Close
              </a-button>
            </div>
            <div class="w-full aspect-video bg-black/90 rounded-md overflow-hidden flex items-center justify-center">
              <video
                :src="lesson.video_url"
                controls
                class="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <template #extra>
        <div class="flex items-center gap-3 text-gray-700 text-xs">
          <div class="flex items-center gap-1">
            <Icon name="i-solar-document-outline" class="text-sm" />
            <span>{{ chapter.lessons_count }} Lessons</span>
          </div>
          <div class="flex items-center gap-1">
            <Icon name="i-solar-clock-circle-outline" class="text-sm" />
            <span>{{ getChapterDuration(chapter.lessons) }}</span>
          </div>
        </div>
      </template>
    </a-collapse-panel>
  </a-collapse>
</template>

<style>
.syllabus {
  .ant-collapse-header-text {
    font-weight: 700 !important;
    font-size: 16px !important;
  }

  .ant-collapse-extra {
    margin-top: 4px !important;
  }
}
</style>
