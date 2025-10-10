<script lang="ts" setup>
interface Props {
  listLesson: any
  chapterId: string
}

const props = defineProps<Props>()
const router = useRouter()
</script>

<template>
  <div class="lesson">
    <div class="flex flex-col gap-3">
      <div v-for="item in props.listLesson" :key="item.id" class="flex items-center justify-between border border-gray-200 rounded-lg p-4 cursor-pointer" @click="router.push(`?chapterId=${chapterId}&lessonId=${item?.id}`)">
        <div class="flex items-center gap-2">
          <Icon name="i-material-symbols-light-play-circle-outline" class="text-2xl text-black" />
          <div class="flex flex-col">
            <h2 class="text-black font-semibold text-base !m-0">
              {{ item?.title }}
            </h2>
            <p class="!m-0 text-[#0A033C] text-xs !p-0">
              Time: {{ item?.video_duration }} minutes
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <a-button type="link">
            Edit
          </a-button>
          <a-button class="!text-red-500" type="link">
            Delete
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>
