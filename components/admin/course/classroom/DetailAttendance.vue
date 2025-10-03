<script lang="ts" setup>
import {
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { message, notification } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()

// Reactive data
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

const open = ref<boolean>(false)
const confirmLoading = ref<boolean>(false)
const formRef = ref()

const formState = ref({
  date: '',
})

const attendances = ref<any[]>([
  {
    id: 1,
    name: 'Attendance for July 20',
    link: 'https://example.com/attendance/july20',
    total: 40,
    count_has: 20,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Attendance for August 10',
    link: 'https://example.com/attendance/aug10',
    total: 35,
    count_has: 28,
    createdAt: '2024-02-05T12:30:00Z',
  },
  {
    id: 3,
    name: 'Attendance for September 02',
    link: 'https://example.com/attendance/sep02',
    total: 50,
    count_has: 45,
    createdAt: '2024-03-12T08:15:00Z',
  },
  {
    id: 4,
    name: 'Attendance for October 15',
    link: 'https://example.com/attendance/oct15',
    total: 60,
    count_has: 52,
    createdAt: '2024-04-22T09:00:00Z',
  },
  {
    id: 5,
    name: 'Attendance for November 05',
    link: 'https://example.com/attendance/nov05',
    total: 45,
    count_has: 33,
    createdAt: '2024-05-18T18:45:00Z',
  },
])

// Table columns
const columns = [
  {
    title: 'Attendance Id',
    dataIndex: 'id',
    key: 'id',
    width: 150,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
  },
  {
    title: 'Link',
    dataIndex: 'link',
    key: 'link',
    width: 200,
  },
  {
    title: 'Date',
    dataIndex: 'time',
    key: 'time',
    width: 200,
  },
  {
    title: 'Attendance count',
    dataIndex: 'count',
    key: 'count',
    width: 100,
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 150,
  },
]

function formatDate(dateString: string | undefined) {
  if (!dateString)
    return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

function handleTableChange(pagination: any) {
  currentPage.value = pagination.current
  pageSize.value = pagination.pageSize
}

function deleteUser(record: any) {

}

async function copyLink(link?: string) {
  if (!link)
    return
  try {
    await navigator.clipboard.writeText(link)
    message.success('Copied link success')
  }
  catch (err) {
    message.error('Copied link failed')
  }
}

async function handleOk() {
  // confirmLoading.value = true
  await formRef.value?.validateFields()
  try {
    notification.success({
      message: 'Create link attendance Success',
    })
    open.value = false
  }
  catch (error) {
    // console.log(error)
  }
}

function showModal() {
  open.value = true
}

function customRow(record: any) {
  return {
    onClick: () => {
      router.push({
        path: `/admin/courses/${route.params.id}`,
        query: {
          ...route.query,
          attendanceManageId: record?.id,
        },
      })
    },
  }
}
</script>

<template>
  <div class="">
    <div class="flex items-center gap-4 justify-between mb-6">
      <div class="flex items-center gap-1 cursor-pointer" @click="router.push(`/admin/courses/${route.params.id}`)">
        <Icon name="i-material-symbols-chevron-left-rounded" class="text-[24px]" />
        <h1 class="text-xl font-bold text-gray-900 dark:text-white !m-0">
          Attendance detail
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <a-button
          type="primary"
          class="w-full !h-12 rounded-lg !flex !items-center !justify-center text-sm !font-semibold bg-green-700 border-green-700 text-white hover:bg-green-800 hover:border-green-800"
          @click="showModal"
        >
          Create Attendance Link
          <Icon name="i-material-symbols-add-2-rounded" class="text-[15px] ml-2" />
        </a-button>
      </div>
    </div>
    <a-card>
      <a-table
        :columns="columns"
        :data-source="attendances"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t: number, r: [number, number]) => `${r[0]}-${r[1]} of ${t} users`,
        }"
        row-key="id"
        :custom-row="customRow"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a-space>
              <span class="font-semibold">{{ record.name }}</span>
            </a-space>
          </template>
          <template v-if="column.key === 'link'">
            <div class="flex items-center gap-2 cursor-pointer" @click="copyLink(record?.link)">
              <Icon
                name="i-material-symbols-light-attach-file"
                class="text-base text-black cursor-pointer"
              />

              <a-typography-text
                :ellipsis="{ tooltip: record?.link }"
                :style="{ maxWidth: '250px' }"
              >
                {{ record?.link }}
              </a-typography-text>
            </div>
          </template>
          <template v-if="column.key === 'time'">
            <p class="!m-0 !p-0">
              {{ formatDate(record?.createdAt) }}
            </p>
          </template>
          <template v-if="column.key === 'count'">
            <div class="border border-gray-300 rounded-full p-1 flex items-center justify-center">
              {{ record?.count_has }}/{{ record?.total }}
            </div>
          </template>
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" class="!flex !items-center" danger @click="deleteUser(record)">
                <DeleteOutlined />
                Delete
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="open" title="Create link attendance" :confirm-loading="confirmLoading" @ok="handleOk">
      <a-form
        ref="formRef"
        :model="formState"
        name="basic"
        autocomplete="off"
        layout="vertical"
        class="flex items-start flex-col w-full"
      >
        <a-form-item
          label="Attendance date"
          name="date"
          class="w-full"
          :rules="[{ required: true, message: 'Please input attendance date!' }]"
        >
          <a-date-picker v-model:value="formState.date" class="w-full !h-11" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
