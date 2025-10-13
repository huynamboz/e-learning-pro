<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useAuth } from '~/composables/useAuth'
import { useUserApi } from '~/composables/api/useUserApi'
import { useFileUpload } from '~/composables/useFileUpload'

definePageMeta({
  middleware: 'auth',
  layout: 'onboarding',
})

const { user, fetchProfile } = useAuth()
const { updateProfile } = useUserApi()
const { uploading, uploadProgress, isUploading, uploadWithPresignedUrl } = useFileUpload()
const router = useRouter()

// Form state
const formRef = ref()
const loading = ref(false)

// Form data
const formData = reactive({
  first_name: user.value?.first_name || '',
  last_name: user.value?.last_name || '',
  avatar: null as File | null,
})

// Avatar preview
const avatarPreview = ref(user.value?.avatar || '')

// Form rules
const rules = {
  first_name: [
    { required: true, message: 'Vui lòng nhập tên', trigger: 'blur' },
    { min: 2, message: 'Tên phải có ít nhất 2 ký tự', trigger: 'blur' },
  ],
  last_name: [
    { required: true, message: 'Vui lòng nhập họ', trigger: 'blur' },
    { min: 2, message: 'Họ phải có ít nhất 2 ký tự', trigger: 'blur' },
  ],
}

// Avatar options
const avatarOptions = [
  { id: 'avatar1', src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Sunglasses&hatColor=Pink&hairColor=Platinum&facialHairType=MoustacheMagnum&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Blue01&graphicType=Bear&eyeType=Squint&eyebrowType=FlatNatural&mouthType=Grimace&skinColor=Light', name: 'Avatar 1' },
  { id: 'avatar2', src: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Kurt&hatColor=PastelRed&hairColor=Black&facialHairType=BeardMajestic&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=Black&eyeType=Close&eyebrowType=AngryNatural&mouthType=ScreamOpen&skinColor=Pale', name: 'Avatar 2' },
  { id: 'avatar3', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Prescription01&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Platinum&clotheType=BlazerSweater&eyeType=Wink&eyebrowType=Angry&mouthType=Smile&skinColor=Light', name: 'Avatar 3' },
  { id: 'avatar4', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Wayfarers&hairColor=Platinum&facialHairType=Blank&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Gray02&eyeType=WinkWacky&eyebrowType=RaisedExcited&mouthType=Serious&skinColor=Yellow', name: 'Avatar 4' },
  { id: 'avatar5', src: 'https://avataaars.io/?avatarStyle=Circle&topType=Hijab&accessoriesType=Kurt&hatColor=PastelYellow&hairColor=Black&facialHairType=BeardLight&facialHairColor=Blonde&clotheType=ShirtScoopNeck&clotheColor=Pink&graphicType=Cumbia&eyeType=Happy&eyebrowType=SadConcernedNatural&mouthType=Serious&skinColor=Pale', name: 'Avatar 5' },
  { id: 'avatar6', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=Platinum&facialHairType=Blank&facialHairColor=Platinum&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Default&skinColor=Tanned', name: 'Avatar 6' },
]

const selectedAvatar = ref('')

// Handle avatar selection
const handleAvatarSelect = (avatarId: string) => {
  selectedAvatar.value = avatarId
  const avatar = avatarOptions.find(a => a.id === avatarId)
  if (avatar) {
    avatarPreview.value = avatar.src
  }
}


// Handle file upload
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước file không được vượt quá 5MB')
      return
    }
    
    formData.avatar = file
    selectedAvatar.value = ''
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    // Prepare update data
    const updateData: any = {
      first_name: formData.first_name,
      last_name: formData.last_name,
    }
    
    // Upload avatar if selected
    if (formData.avatar) {
      try {
        const publicUrl = await uploadWithPresignedUrl(
          formData.avatar,
          'Tải lên avatar thất bại'
        )
        
        updateData.avatar = publicUrl
        
      } catch (error) {
        return // Error already handled in composable
      }
    } else if (selectedAvatar.value) {
      // Use selected avatar
      const avatar = avatarOptions.find(a => a.id === selectedAvatar.value)
      if (avatar) {
        updateData.avatar = avatar.src
      }
    }
    
    // Update profile
    await updateProfile(updateData)

    // Refresh user data
    await fetchProfile()

    
    message.success('Cập nhật thông tin thành công!')
    
    // Redirect to learning page
    await router.push('/learning')
    
  } catch (error: any) {
    console.error('Error updating profile:', error)
    message.error('Cập nhật thông tin thất bại')
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
          <Icon name="solar:user-circle-bold" size="32" class="text-white" />
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Hoàn thiện hồ sơ của bạn
        </h1>
        <p class="text-gray-600">
          Hãy cung cấp một số thông tin cơ bản để chúng tôi có thể cá nhân hóa trải nghiệm học tập cho bạn
        </p>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <a-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          layout="vertical"
          @finish="handleSubmit"
        >
          <!-- Avatar Section -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Chọn avatar</h3>
            
            <!-- Current Avatar Preview -->
            <div class="flex justify-center mb-6">
              <div class="relative">
                <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    v-if="avatarPreview"
                    :src="avatarPreview"
                    alt="Avatar preview"
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Icon name="solar:user-bold" size="32" class="text-gray-400" />
                  </div>
                </div>
                <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Icon name="solar:camera-bold" size="16" class="text-white" />
                </div>
              </div>
            </div>

            <!-- Avatar Options -->
            <div class="grid grid-cols-6 gap-3 mb-4">
              <div
                v-for="avatar in avatarOptions"
                :key="avatar.id"
                class="aspect-square rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105"
                :class="selectedAvatar === avatar.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'"
                @click="handleAvatarSelect(avatar.id)"
              >
                <img :src="avatar.src" :alt="avatar.name" class="w-full h-full object-cover">
              </div>
            </div>

            <!-- Upload Custom Avatar -->
            <div class="text-center">
              <label class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                <Icon name="solar:upload-bold" size="16" class="mr-2" />
                Tải lên ảnh của bạn
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileUpload"
                >
              </label>
              <p class="text-xs text-gray-500 mt-2">JPG, PNG tối đa 5MB</p>
            </div>
          </div>

          <!-- Name Fields -->
          <div class="grid md:grid-cols-2 gap-6 mb-8">
            <a-form-item label="Tên" name="first_name">
              <a-input
                v-model:value="formData.first_name"
                placeholder="Nhập tên của bạn"
                size="large"
              >
                <template #prefix>
                  <Icon name="solar:user-bold" size="16" class="text-gray-400" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item label="Họ" name="last_name">
              <a-input
                v-model:value="formData.last_name"
                placeholder="Nhập họ của bạn"
                size="large"
              >
                <template #prefix>
                  <Icon name="solar:user-bold" size="16" class="text-gray-400" />
                </template>
              </a-input>
            </a-form-item>
          </div>

          <!-- Progress Section -->
          <div v-if="isUploading" class="mb-6">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Đang tải lên avatar...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <a-progress 
              :percent="uploadProgress" 
              :show-info="false" 
              status="active" 
              stroke-color="#3b82f6"
              class="!h-2"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center">
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
              :disabled="isUploading"
              class="min-w-[160px] !flex !items-center !justify-center"
            >
              <Icon 
                :name="isUploading ? 'solar:upload-bold' : 'solar:check-circle-bold'" 
                size="16" 
                class="mr-2" 
              />
              {{ isUploading ? `Đang tải lên ${uploadProgress}%` : 'Hoàn thành' }}
            </a-button>
          </div>
        </a-form>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-gray-500">
          Thông tin này sẽ giúp chúng tôi cá nhân hóa trải nghiệm học tập cho bạn
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better visual appeal */
:deep(.ant-form-item-label > label) {
  font-weight: 600;
  color: #374151;
}

:deep(.ant-input) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.ant-input:hover) {
  border-color: #3b82f6;
}

:deep(.ant-input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

:deep(.ant-btn-primary) {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.ant-btn-primary:hover) {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

:deep(.ant-btn) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
}
</style>
