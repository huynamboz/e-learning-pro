<script setup lang="ts">
import type { EssayGrading, GradeEssayRequest } from '~/composables/api/useQuizApi'
import { notification } from 'ant-design-vue'
import { useQuizApi } from '~/composables/api/useQuizApi'

definePageMeta({
  layout: 'admin',
})

// Route params
const route = useRoute()
const gradingId = route.params.id as string

// API composable
const { getEssayGradingDetail, gradeEssay } = useQuizApi()

// State
const essayGrading = ref<EssayGrading | null>(null)
const loading = ref(false)
const grading = ref(false)
const error = ref<string | null>(null)

// Form data
const formData = reactive<GradeEssayRequest>({
  score: 0,
  feedback: '',
  corrected_answer: '',
})

// Form validation
const formRef = ref()

// Computed
const maxScore = computed(() => essayGrading.value?.max_score || 0)
const rules = computed(() => ({
  score: [
    { required: true, message: 'Vui lòng nhập điểm!', trigger: 'blur' },
    {
      type: 'number',
      min: 0,
      max: maxScore.value,
      message: `Điểm phải từ 0 đến ${maxScore.value}!`,
      trigger: 'blur',
    },
  ],
  feedback: [
    { required: true, message: 'Vui lòng nhập phản hồi!', trigger: 'blur' },
  ],
}))

// Methods
async function loadEssayGrading() {
  try {
    loading.value = true
    error.value = null

    const response = await getEssayGradingDetail(gradingId)
    essayGrading.value = response

    // Set max score as default
    formData.score = Number(response.max_score)
  }
  catch (err: any) {
    error.value = err.message || 'Failed to load essay grading'
    console.error('Error loading essay grading:', err)
  }
  finally {
    loading.value = false
  }
}

async function handleSubmit() {
  try {
    await formRef.value.validate()

    grading.value = true

    await gradeEssay(gradingId, formData)

    notification.success({
      message: 'Thành công',
      description: 'Đã chấm điểm bài tự luận thành công!',
      duration: 3,
    })

    // Redirect back to quiz management
    await navigateTo('/admin/quiz-management')
  }
  catch (err: any) {
    notification.error({
      message: 'Lỗi',
      description: err.message || 'Failed to grade essay',
      duration: 4,
    })
    console.error('Error grading essay:', err)
  }
  finally {
    grading.value = false
  }
}

function handleCancel() {
  navigateTo('/admin/quiz-management')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(() => {
  loadEssayGrading()
})
</script>

<template>
  <div class="p-4 sm:p-6 max-md:px-0">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
        <a-button type="text" class="text-xs sm:text-sm" @click="navigateTo('/admin/quiz-management')">
          <template #icon>
            <Icon name="tabler:arrow-left" class="text-sm sm:text-base" />
          </template>
          <span class="hidden sm:inline">Quay lại</span>
        </a-button>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
            Chấm điểm bài tự luận
          </h1>
          <p class="text-sm sm:text-base text-gray-600">
            Đánh giá và phản hồi cho bài làm của học sinh
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8 sm:py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4" />
        <p class="text-sm sm:text-base text-gray-600">
          Đang tải thông tin bài làm...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
      <div class="flex items-start gap-3">
        <Icon name="tabler:alert-circle" class="text-red-500 text-lg sm:text-xl mt-0.5" />
        <div>
          <h3 class="text-sm sm:text-base text-red-800 font-medium">
            Lỗi
          </h3>
          <p class="text-xs sm:text-sm text-red-700">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Essay Grading Content -->
    <div v-else-if="essayGrading" class="space-y-4 sm:space-y-6">
      <!-- Student Info -->
      <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Thông tin học sinh
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p class="text-xs sm:text-sm text-gray-600 mb-1">
              <span class="font-medium">Tên:</span> {{ essayGrading.student_name }}
            </p>
            <!-- <p class="text-xs sm:text-sm text-gray-600 mb-1">
              <span class="font-medium">Email:</span> {{ essayGrading.student_email }}
            </p> -->
          </div>
          <div>
            <!-- <p class="text-xs sm:text-sm text-gray-600 mb-1">
              <span class="font-medium">Quiz:</span> {{ essayGrading.quiz_title }}
            </p> -->
            <p class="text-xs sm:text-sm text-gray-600">
              <span class="font-medium">Ngày nộp:</span> {{ formatDate(essayGrading.created_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Question -->
      <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Câu hỏi
        </h3>
        <div class="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg">
          <p class="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">
            {{ essayGrading.question_prompt }}
          </p>
        </div>
      </div>

      <!-- Student Answer -->
      <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Câu trả lời của học sinh
        </h3>
        <div class="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
          <p class="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">
            {{ essayGrading.student_answer_text }}
          </p>
        </div>
      </div>

      <!-- Grading Form -->
      <div class="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Chấm điểm
        </h3>

        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 max-md:gap-1">
            <!-- Score Input -->
            <div>
              <a-form-item label="Điểm số" name="score">
                <div class="space-y-2">
                  <a-input-number
                    v-model:value="formData.score"
                    :min="0"
                    :max="maxScore"
                    :step="0.1"
                    class="w-full"
                    placeholder="Nhập điểm"
                  />
                  <div class="text-xs sm:text-sm text-gray-600">
                    <span class="font-medium">Điểm tối đa:</span> {{ maxScore }} điểm
                  </div>
                </div>
              </a-form-item>
            </div>

            <!-- Score Preview -->
            <div>
              <label class="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Xem trước điểm</label>
              <div class="bg-gray-50 border border-gray-200 p-3 sm:p-4 rounded-lg">
                <div class="text-center">
                  <div class="text-xl sm:text-2xl font-bold text-gray-900">
                    {{ formData.score }}/{{ maxScore }}
                  </div>
                  <div class="text-xs sm:text-sm text-gray-600">
                    <span
                      :class="{
                        'text-green-600': formData.score >= maxScore * 0.8,
                        'text-yellow-600': formData.score >= maxScore * 0.6 && formData.score < maxScore * 0.8,
                        'text-red-600': formData.score < maxScore * 0.6,
                      }"
                    >
                      {{ formData.score >= maxScore * 0.8 ? 'Xuất sắc' : formData.score >= maxScore * 0.6 ? 'Khá' : 'Cần cải thiện' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feedback -->
          <a-form-item label="Phản hồi cho học sinh" name="feedback" class="mt-4 sm:mt-6">
            <a-textarea
              v-model:value="formData.feedback"
              :rows="3"
              placeholder="Nhập phản hồi chi tiết cho học sinh..."
              class="w-full"
            />
          </a-form-item>

          <!-- Corrected Answer (Optional) -->
          <!-- <a-form-item label="Đáp án đã sửa (tùy chọn)" name="corrected_answer">
            <a-textarea
              v-model:value="formData.corrected_answer"
              :rows="4"
              placeholder="Nhập phiên bản đã sửa của câu trả lời (nếu cần)..."
              class="w-full"
            />
            <div class="text-sm text-gray-500 mt-1">
              Đáp án đã sửa sẽ thay thế câu trả lời gốc của học sinh
            </div>
          </a-form-item> -->

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
            <a-button class="text-xs sm:text-sm" @click="handleCancel">
              Hủy
            </a-button>
            <a-button
              type="primary"
              html-type="submit"
              :loading="grading"
              class="text-xs sm:text-sm"
            >
              <template #icon>
                <Icon name="tabler:check" class="text-sm sm:text-base" />
              </template>
              Chấm điểm
            </a-button>
          </div>
        </a-form>
      </div>
    </div>
  </div>
</template>
