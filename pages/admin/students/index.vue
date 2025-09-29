<script setup lang="ts">
import type { Student } from '~/resources/admin/student'
import {
  CaretDownOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { LIST_STUDENTS } from '~/resources/admin/student'

// Page title for SEO
useHead({
  title: 'Student Management - Admin Dashboard',
})

// Reactive data
const showAddDrawer = ref(false)
const selectedStudent = ref<Student | null>(null)
const formRef = ref()

// New student form data
const newStudent = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: undefined as 'Male' | 'Female' | undefined,
})

// Form validation rules
const formRules = {
  firstName: [
    { required: true, message: 'Please input first name!', trigger: 'blur' },
  ],
  lastName: [
    { required: true, message: 'Please input last name!', trigger: 'blur' },
  ],
  email: [
    { required: true, message: 'Please input email!', trigger: 'blur' },
    { type: 'email', message: 'Please input valid email!', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'Please input phone number!', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: 'Please select gender!', trigger: 'change' },
  ],
}

// Sample students data
const students = ref<Student[]>(LIST_STUDENTS)

// Methods
function resetForm() {
  Object.assign(newStudent, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: undefined,
  })
  formRef.value?.resetFields()
}

function selectStudent(student: Student) {
  selectedStudent.value = student
}

function editStudent(student: Student) {
  // Implementation for editing student
  message.info(`Edit student: ${student.name}`)
}

function deleteStudent(student: Student) {
  // Implementation for deleting student
  const index = students.value.findIndex(s => s.id === student.id)
  if (index > -1) {
    students.value.splice(index, 1)
    if (selectedStudent.value?.id === student.id) {
      selectedStudent.value = null
    }
    message.success(`Student ${student.name} deleted successfully`)
  }
}

async function addStudent() {
  try {
    await formRef.value.validate()

    const newStudentData: Student = {
      id: students.value.length + 1,
      name: `${newStudent.firstName} ${newStudent.lastName}`,
      email: newStudent.email,
      phone: newStudent.phone,
      gender: newStudent.gender!,
      role: 'Student',
    }

    students.value.unshift(newStudentData)
    message.success('Student added successfully')
    resetForm()
    showAddDrawer.value = false
  }
  catch (error) {
    console.error('Validation failed:', error)
  }
}

// Auto-select first student on mount
onMounted(() => {
  if (students.value.length > 0) {
    selectedStudent.value = students.value[0]
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content Area -->
    <div class="p-8 flex gap-8">
      <!-- Students Table Section -->
      <div class="flex-1">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900">
            All Students
          </h1>
          <a-button
            type="primary"
            class="px-6 py-2 h-10 rounded-lg"
            @click="showAddDrawer = true"
          >
            <div class="flex items-center">
              <PlusOutlined class="w-4 h-4 mr-2" />
              Add Student
            </div>
          </a-button>
        </div>

        <!-- Table Header -->
        <div class="grid grid-cols-10 gap-4 px-5 py-3 text-xs font-medium text-gray-500 uppercase border-b border-gray-200">
          <div class="col-span-3 flex items-center space-x-2">
            <span>Name</span>
            <CaretDownOutlined class="w-3 h-3" />
          </div>
          <div class="col-span-3 flex items-center space-x-2">
            <span>Email</span>
            <CaretDownOutlined class="w-3 h-3" />
          </div>
          <div class="col-span-2 flex items-center space-x-2">
            <span>Phone number</span>
            <CaretDownOutlined class="w-3 h-3" />
          </div>
          <div class="col-span-1 flex items-center space-x-2">
            <span>Gender</span>
            <CaretDownOutlined class="w-3 h-3" />
          </div>
          <div class="col-span-1" />
        </div>

        <!-- Students List -->
        <div class="space-y-3 mt-4">
          <div
            v-for="student in students"
            :key="student.id"
            class="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
            :class="{ 'ring-2 ring-blue-500 border-blue-500 shadow-[1px_17px_44px_0px_#03022912]': selectedStudent?.id === student.id }"
            @click="selectStudent(student)"
          >
            <div class="grid grid-cols-10 gap-4 items-center">
              <!-- Avatar and Name -->
              <div class="col-span-3 flex items-center space-x-3">
                <span class="font-medium text-gray-900">{{ student.name }}</span>
              </div>

              <!-- Email -->
              <div class="col-span-3">
                <span class="text-gray-700">{{ student.email }}</span>
              </div>

              <!-- Phone -->
              <div class="col-span-2">
                <span class="text-gray-700">{{ student.phone }}</span>
              </div>

              <!-- Gender -->
              <div class="col-span-1">
                <a-tag
                  :color="student.gender === 'Male' ? 'blue' : 'orange'"
                  class="rounded-full px-3 py-1"
                >
                  {{ student.gender }}
                </a-tag>
              </div>

              <!-- Actions -->
              <div class="col-span-1 flex justify-end">
                <a-dropdown>
                  <a-button type="text" class="text-gray-400 group hover:text-gray-600">
                    <Icon name="uil:ellipsis-h" class="text-xl group-hover:text-[#605BFF]" />
                  </a-button>
                  <template #overlay>
                    <a-menu class="!space-y-0.5">
                      <a-menu-item key="edit" class="bg-[#5B93FF]/20" @click="editStudent(student)">
                        <div class="flex items-center gap-1">
                          <Icon
                            name="mynaui:edit"
                            class="text-[#5B93FF] text-sm"
                          />
                          <span class="text-[#5B93FF]">
                            Edit
                          </span>
                        </div>
                      </a-menu-item>
                      <a-menu-item key="delete" class="bg-[#E71D36]/20 mt-1" @click="deleteStudent(student)">
                        <div class="flex items-center gap-1">
                          <Icon
                            name="ic:baseline-delete"
                            class="text-[#E71D36] text-sm"
                          />
                          <span class="text-[#E71D36]">
                            Delete
                          </span>
                        </div>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Detail Sidebar -->
      <div
        v-if="selectedStudent"
        class="w-80 bg-white rounded-lg p-6 border border-gray-100 h-fit sticky top-8 h-full"
      >
        <!-- Profile Section -->
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-1">
            {{ selectedStudent.name }}
          </h3>
          <p class="text-gray-500 text-sm">
            {{ selectedStudent.role || 'UI/UX Designer' }}
          </p>
        </div>

        <!-- Separator -->
        <div class="w-full h-px bg-gray-200 mt-4" />
        <div class="space-y-6">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4">
              Contact Info
            </h4>

            <!-- Location -->
            <div class="flex items-start space-x-3 mb-4">
              <EnvironmentOutlined class="w-4 h-4 text-gray-400 mt-1" />
              <div class="text-sm text-gray-600">
                <div>{{ selectedStudent?.address || '2239 Hog Camp Road' }}</div>
                <div>{{ selectedStudent?.city || 'Schaumburg' }}</div>
              </div>
            </div>

            <div class="w-full h-px bg-gray-200" />
          </div>

          <!-- Phone -->
          <div class="flex items-center space-x-3 mb-4">
            <PhoneOutlined class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600">{{ selectedStudent?.phone }}</span>
          </div>

          <!-- Email -->
          <div class="flex items-center space-x-3">
            <MailOutlined class="w-4 h-4 text-gray-400" />
            <span class="text-sm text-gray-600">{{ selectedStudent?.email }}</span>
          </div>
        </div>
      </div>
    </div>
    <a-drawer
      v-model:open="showAddDrawer"
      title="Add Student"
      :width="480"
      placement="right"
      @close="resetForm"
    >
      <div class="space-y-6">
        <a-form
          ref="formRef"
          :model="newStudent"
          layout="vertical"
          :rules="formRules"
        >
          <!-- <div class="grid grid-cols-2 gap-4"> -->
          <a-form-item label="First Name" name="firstName">
            <a-input
              v-model:value="newStudent.firstName"
              placeholder="John"
              class="h-12 rounded-lg"
            />
          </a-form-item>

          <a-form-item label="Last Name" name="lastName">
            <a-input
              v-model:value="newStudent.lastName"
              placeholder="Deo"
              class="h-12 rounded-lg"
            />
          </a-form-item>
          <!-- </div> -->

          <a-form-item label="Email" name="email">
            <a-input
              v-model:value="newStudent.email"
              placeholder="Example@gmail.com"
              type="email"
              class="h-12 rounded-lg"
            />
          </a-form-item>

          <a-form-item label="Phone Number" name="phone">
            <a-input
              v-model:value="newStudent.phone"
              placeholder="33757005467"
              class="h-12 rounded-lg"
            />
          </a-form-item>

          <a-form-item label="Gender" name="gender">
            <a-select
              v-model:value="newStudent.gender"
              placeholder="Male"
              class="h-12"
            >
              <a-select-option value="Male">
                Male
              </a-select-option>
              <a-select-option value="Female">
                Female
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 gap-2">
          <a-button class="px-6" @click="showAddDrawer = false">
            Cancel
          </a-button>
          <a-button
            type="primary"
            class="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 px-6"
            @click="addStudent"
          >
            Add Student
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<style scoped>
:deep(.ant-select-selector) {
  border-color: #d9d9d9 !important;
}
</style>
