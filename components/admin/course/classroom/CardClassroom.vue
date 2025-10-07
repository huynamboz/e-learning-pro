<script setup lang="ts">
const router = useRouter()

defineProps<{
    classRoomData: any
}>()

// function handleViewAttendance () {

// }
</script>

<template>
  <div
    class="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
  >
    <div class="space-y-4">
      <div class="space-y-1">
        <h3 class="text-xs sm:text-base text-gray-500 leading-tight">
           Name
        </h3>
        <p class="text-lg sm:text-base text-black font-semibold">
          {{ classRoomData?.name }}
        </p>
      </div>
      <div class="space-y-2">
        <h3 class="text-xs sm:text-base text-gray-500 !m-0 !p-0">
           Student
        </h3>
        <p class="text-lg sm:text-base text-black font-semibold !m-0 !p-0">
          {{ classRoomData?.students }}
        </p>
      </div>
      <div class="space-y-1">
        <h3 class="text-xs sm:text-sm font-medium text-gray-900 leading-tight">
           Schedule
        </h3>
        <div class="flex flex-col gap-2">
            <p v-for="item in classRoomData?.schedule" :key="item.id" class="p-3 rounded-lg border boder-grey-800 w-full font-semibold text-base !m-0">
                {{ item?.day }}: {{ item?.start }} - {{ item?.end }}
            </p>
        </div>
      </div>
      <div class="line w-full !bg-gray-200 h-[1px]"></div>
      <div class="flex flex-col gap-2">
        <a-button
          type="primary"
          class="w-full !px-6 !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="router.push(`?classroomId=${classRoomData?.id}`)"
        >
          View Classroom
        </a-button>
        <a-button
          type="primary"
          class="w-full !px-6 !h-12 rounded-lg text-sm !font-semibold flex items-center justify-center bg-red-100 border-red-100 text-red-600 hover:bg-red-200 hover:border-red-200 hover:text-red-700"
          @click="router.push(`?attendanceId=${classRoomData?.id}`)"
        >
          View Attendance
        </a-button>
      </div>
    </div>
</div>
</template>
