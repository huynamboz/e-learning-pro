<script lang="ts" setup>
import CardClassroom from './CardClassroom.vue'

// defineProps<{
//   classRoomData: any
// }>()

const classRoomData = ref([
  {
    id: 1,
    name: 'Class for newbie',
    students: 30,
    schedule: [
      {
        id: 'id-1',
        day: 'Thurday',
        start: '8:40',
        end: '9:50',
      },
      {
        id: 'id-1',
        day: 'Friday',
        start: '8:40',
        end: '9:50',
      },
      {
        id: 'id-1',
        day: 'Monday',
        start: '8:40',
        end: '9:50',
      },
    ],
  },
  {
    id: 2,
    name: 'Class for Advanced',
    students: 30,
    schedule: [
      {
        id: 'id-1',
        day: 'Thurday',
        start: '8:40',
        end: '9: 50',
      },
      {
        id: 'id-1',
        day: 'Friday',
        start: '8:40',
        end: '9:50',
      },
      {
        id: 'id-1',
        day: 'Monday',
        start: '8:40',
        end: '9:50',
      },
    ],
  },
])

const open = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
const formRef = ref()

const daysOfWeek = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
]

const formState = ref({
  name: '',
  student: '',
  schedule: [
    { day: null, start: null, end: null },
  ],
})

function AddNewClassroom() {
  open.value = true
}

function addScheduleItem() {
  formState.value.schedule.push({ day: null, start: null, end: null })
}

function removeScheduleItem(index: number) {
  if (index > 0) {
    formState.value.schedule.splice(index, 1)
  }
}

async function handleOk() {
  await formRef.value?.validateFields()
}
</script>

<template>
  <div class="classroom">
    <a-button
      type="primary"
      class="!px-6 !h-12 rounded-lg text-sm !font-semibold !flex !items-center !justify-center gap-1 !bg-[#548A1D] !my-6"
      @click="AddNewClassroom"
    >
      Add new classroom
      <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
    </a-button>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      <CardClassroom
        v-for="item in classRoomData"
        :key="item.id"
        :class-room-data="item"
      />
    </div>

    <a-modal v-model:open="open" title="Create class room" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          label="Name"
          name="name"
          class="w-full"
          :rules="[{ required: true, message: 'Please input name!' }]"
        >
          <a-input v-model:value="formState.name" size="large" placeholder="Enter name classroom" />
        </a-form-item>

        <a-form-item
          label="Student count"
          name="student"
          class="w-full"
          :rules="[{ required: true, message: 'Please input student count!' }]"
        >
          <a-input v-model:value="formState.student" size="large" placeholder="Enter student count" />
        </a-form-item>

        <a-form-item
          label="Schedule"
          name="schedule"
          class="w-full"
          :rules="[{ required: true, message: 'Please input schedule!' }]"
        >
          <div class="flex flex-col gap-3 w-full">
            <div
              v-for="(item, index) in formState.schedule"
              :key="index"
              class="flex items-center gap-2 w-full"
            >
              <a-select
                v-model:value="item.day"
                placeholder="Chọn thứ"
                class="h-10 w-1/3"
                :rules="[{ required: true, message: 'Please select day!' }]"
              >
                <a-select-option
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  :value="day.value"
                >
                  {{ day.label }}
                </a-select-option>
              </a-select>

              <a-time-picker
                v-model:value="item.start"
                format="HH:mm"
                :minute-step="30"
                placeholder="Start time"
                size="large"
                class="w-full"
              />

              <a-time-picker
                v-model:value="item.end"
                format="HH:mm"
                :minute-step="30"
                size="large"
                class="w-full"
                placeholder="End time"
              />

              <div class="">
                <Icon v-if="index > 0" name="i-material-symbols-delete-outline" class="text-[16px] text-red-500 cursor-pointer" @click="removeScheduleItem(index)" />
              </div>
            </div>

            <a-button
              type="primary"
              class="!h-10 !mt-2 !flex !items-center !gap-2 w-[118px]"
              @click="addScheduleItem"
            >
              Add more
              <Icon name="i-material-symbols-add-2-rounded" class="text-[16px] text-white" />
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
