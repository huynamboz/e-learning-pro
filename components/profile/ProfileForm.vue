<script lang="ts" setup>
import type { Profile } from '@/types/auth.type'
import { useAuth } from '#imports'
import { notification } from 'ant-design-vue'
import { useFileUpload } from '~/composables/useFileUpload'

const props = defineProps<{
  dataProfile?: Profile
  isFetchingProfile: boolean
}>()

const { updateProfile, fetchProfile } = useAuth()
const { t } = useI18n()
const { uploadProgress, isUploading, uploadWithPresignedUrl } = useFileUpload()

const formRef = ref()

const formState = reactive({
  first_name: '',
  last_name: '',
  email: '',
  avatar: null as File | null,
})

// Avatar preview
const avatarPreview = ref('')
const selectedAvatar = ref('')

// Avatar options
const avatarOptions = [
  { id: 'avatar1', src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Sunglasses&hatColor=Pink&hairColor=Platinum&facialHairType=MoustacheMagnum&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Blue01&graphicType=Bear&eyeType=Squint&eyebrowType=FlatNatural&mouthType=Grimace&skinColor=Light', name: 'Avatar 1' },
  { id: 'avatar2', src: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Kurt&hatColor=PastelRed&hairColor=Black&facialHairType=BeardMajestic&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=Black&eyeType=Close&eyebrowType=AngryNatural&mouthType=ScreamOpen&skinColor=Pale', name: 'Avatar 2' },
  { id: 'avatar3', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Prescription01&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Platinum&clotheType=BlazerSweater&eyeType=Wink&eyebrowType=Angry&mouthType=Smile&skinColor=Light', name: 'Avatar 3' },
  { id: 'avatar4', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Wayfarers&hairColor=Platinum&facialHairType=Blank&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Gray02&eyeType=WinkWacky&eyebrowType=RaisedExcited&mouthType=Serious&skinColor=Yellow', name: 'Avatar 4' },
  { id: 'avatar5', src: 'https://avataaars.io/?avatarStyle=Circle&topType=Hijab&accessoriesType=Kurt&hatColor=PastelYellow&hairColor=Black&facialHairType=BeardLight&facialHairColor=Blonde&clotheType=ShirtScoopNeck&clotheColor=Pink&graphicType=Cumbia&eyeType=Happy&eyebrowType=SadConcernedNatural&mouthType=Serious&skinColor=Pale', name: 'Avatar 5' },
  { id: 'avatar6', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=Platinum&facialHairType=Blank&facialHairColor=Platinum&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Default&skinColor=Tanned', name: 'Avatar 6' },
]

watch(
  () => props.dataProfile,
  (val) => {
    if (val) {
      formState.first_name = val.first_name || ''
      formState.last_name = val.last_name || ''
      formState.email = val.email || ''
      avatarPreview.value = val.avatar || ''
    }
  },
  { immediate: true },
)

// Handle avatar selection
function handleAvatarSelect(avatarId: string) {
  selectedAvatar.value = avatarId
  const avatar = avatarOptions.find(a => a.id === avatarId)
  if (avatar) {
    avatarPreview.value = avatar.src
  }
}

// Handle file upload
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      notification.error({ message: t('profileForm.avatar.invalidFileType') })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({ message: t('profileForm.avatar.fileSizeExceeded') })
      return
    }

    formState.avatar = file
    selectedAvatar.value = ''

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function onFinish() {
  await formRef.value?.validateFields()
  try {
    // Prepare update data
    const updateData: any = {
      first_name: formState.first_name,
      last_name: formState.last_name,
    }

    // Upload avatar if selected
    if (formState.avatar) {
      try {
        const publicUrl = await uploadWithPresignedUrl(
          formState.avatar,
          t('profileForm.avatar.uploadFailed'),
        )
        updateData.avatar = publicUrl
      }
      catch (error) {
        console.error('Error uploading avatar:', error)
        return
      }
    }
    else if (selectedAvatar.value) {
      // Use selected avatar
      const avatar = avatarOptions.find(a => a.id === selectedAvatar.value)
      if (avatar) {
        updateData.avatar = avatar.src
      }
    }

    const response = updateProfile(updateData)
    if ((await response).success) {
      notification.success({
        message: t('profileForm.messages.updateSuccess'),
      })
      fetchProfile()
    }
  }
  catch (error: any) {
    console.error('Error updating profile:', error)
    notification.error({
      message: t('profileForm.messages.updateFailed'),
    })
  }
}
</script>

<template>
  <a-form
    ref="formRef"
    :model="formState"
    name="basic"
    autocomplete="off"
    layout="vertical"
    class="flex flex-col gap-8 w-full !pb-20"
    @finish="onFinish"
  >
    <!-- Avatar Section -->
    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ $t('profileForm.avatar.title') }}
      </h3>

      <!-- Current Avatar Preview -->
      <div class="flex justify-center mb-6">
        <div class="relative">
          <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar preview"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
              <Icon name="solar:user-bold" size="24" class="text-gray-400" />
            </div>
          </div>
          <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Icon name="solar:camera-bold" size="12" class="text-white" />
          </div>
        </div>
      </div>

      <!-- Avatar Options -->
      <div class="flex flex-wrap justify-center items-center gap-2 mb-4">
        <div
          v-for="avatar in avatarOptions"
          :key="avatar.id"
          class="aspect-square rounded-full size-20 overflow-hidden border-2 cursor-pointer transition-all hover:scale-105"
          :class="selectedAvatar === avatar.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'"
          @click="handleAvatarSelect(avatar.id)"
        >
          <img :src="avatar.src" :alt="avatar.name" class="size-20 object-cover">
        </div>
      </div>

      <!-- Upload Custom Avatar -->
      <div class="text-center">
        <label class="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
          <Icon name="solar:upload-bold" size="14" class="mr-2" />
          {{ $t('profileForm.avatar.uploadCustom') }}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          >
        </label>
        <p class="text-xs text-gray-500 mt-1">
          {{ $t('profileForm.avatar.fileFormat') }}
        </p>
      </div>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{{ $t('profileForm.avatar.uploading') }}</span>
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
    </div>

    <!-- Personal Info -->
    <div class="flex flex-col rounded-lg border border-[#E2E8F0] p-6 w-full">
      <div class="flex items-center gap-3">
        <a-form-item
          :label="$t('profileForm.firstName')"
          name="first_name"
          :rules="[{ required: true, message: $t('profileForm.validation.firstNameRequired') }]"
          class="w-full"
        >
          <a-input v-model:value="formState.first_name" size="large" :placeholder="$t('profileForm.enterFirstName')" />
        </a-form-item>
        <a-form-item
          :label="$t('profileForm.lastName')"
          name="last_name"
          :rules="[{ required: true, message: $t('profileForm.validation.lastNameRequired') }]"
          class="w-full"
        >
          <a-input v-model:value="formState.last_name" size="large" :placeholder="$t('profileForm.enterLastName')" />
        </a-form-item>
      </div>

      <a-form-item
        :label="$t('profileForm.email')"
        name="email"
        disabled
        class="w-1/2"
      >
        <a-input v-model:value="formState.email" size="large" :placeholder="$t('profileForm.enterEmail')" disabled />
      </a-form-item>
    </div>


    <div class="text-right w-full">
      <a-button 
        :loading="isFetchingProfile || isUploading" 
        :disabled="isUploading"
        type="primary" 
        class="max-w-[148px] !h-[40px]" 
        html-type="submit"
      >
        {{ isUploading ? `${$t('profileForm.avatar.uploading')} ${uploadProgress}%` : $t('profileForm.updateProfile') }}
      </a-button>
    </div>
  </a-form>
</template>
