<script setup lang="ts">
import { notification } from 'ant-design-vue'

interface Props {
  formData: {
    first_name: string
    last_name: string
    avatar: File | null
  }
  avatarPreview: string
  selectedAvatar: string
}

interface Emits {
  (e: 'update:formData', value: any): void
  (e: 'update:avatarPreview', value: string): void
  (e: 'update:selectedAvatar', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const { t } = useI18n()

// Avatar options
const avatarOptions = [
  { id: 'avatar1', src: 'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Sunglasses&hatColor=Pink&hairColor=Platinum&facialHairType=MoustacheMagnum&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Blue01&graphicType=Bear&eyeType=Squint&eyebrowType=FlatNatural&mouthType=Grimace&skinColor=Light', name: 'Avatar 1' },
  { id: 'avatar2', src: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortWaved&accessoriesType=Kurt&hatColor=PastelRed&hairColor=Black&facialHairType=BeardMajestic&facialHairColor=Brown&clotheType=ShirtScoopNeck&clotheColor=Black&eyeType=Close&eyebrowType=AngryNatural&mouthType=ScreamOpen&skinColor=Pale', name: 'Avatar 2' },
  { id: 'avatar3', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Prescription01&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Platinum&clotheType=BlazerSweater&eyeType=Wink&eyebrowType=Angry&mouthType=Smile&skinColor=Light', name: 'Avatar 3' },
  { id: 'avatar4', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairFro&accessoriesType=Wayfarers&hairColor=Platinum&facialHairType=Blank&facialHairColor=Blonde&clotheType=BlazerSweater&clotheColor=Gray02&eyeType=WinkWacky&eyebrowType=RaisedExcited&mouthType=Serious&skinColor=Yellow', name: 'Avatar 4' },
  { id: 'avatar5', src: 'https://avataaars.io/?avatarStyle=Circle&topType=Hijab&accessoriesType=Kurt&hatColor=PastelYellow&hairColor=Black&facialHairType=BeardLight&facialHairColor=Blonde&clotheType=ShirtScoopNeck&clotheColor=Pink&graphicType=Cumbia&eyeType=Happy&eyebrowType=SadConcernedNatural&mouthType=Serious&skinColor=Pale', name: 'Avatar 5' },
  { id: 'avatar6', src: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=Platinum&facialHairType=Blank&facialHairColor=Platinum&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=WinkWacky&eyebrowType=UpDown&mouthType=Default&skinColor=Tanned', name: 'Avatar 6' },
]

// Handle avatar selection
function handleAvatarSelect(avatarId: string) {
  emit('update:selectedAvatar', avatarId)
  const avatar = avatarOptions.find(a => a.id === avatarId)
  if (avatar) {
    emit('update:avatarPreview', avatar.src)
  }
}

// Handle file upload
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      notification.error({ message: t('onboarding.step1.notifications.invalidFileType') })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notification.error({ message: t('onboarding.step1.notifications.fileSizeExceeded') })
      return
    }

    emit('update:formData', { ...props.formData, avatar: file })
    emit('update:selectedAvatar', '')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      emit('update:avatarPreview', e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Avatar Section -->
    <div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        {{ $t('onboarding.step1.avatar.title') }}
      </h3>

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
          {{ $t('onboarding.step1.avatar.uploadLabel') }}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
          >
        </label>
        <p class="text-xs text-gray-500 mt-2">
          {{ $t('onboarding.step1.avatar.uploadDescription') }}
        </p>
      </div>
    </div>

    <!-- Name Fields -->
    <div class="grid md:grid-cols-2 gap-6">
      <a-form-item :label="$t('onboarding.step1.name.firstName')" name="first_name">
        <a-input
          :value="formData.first_name"
          :placeholder="$t('onboarding.step1.name.firstNamePlaceholder')"
          size="large"
          @input="(e: any) => emit('update:formData', { ...props.formData, first_name: e.target.value })"
        >
          <template #prefix>
            <Icon name="solar:user-bold" size="16" class="text-gray-400" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item :label="$t('onboarding.step1.name.lastName')" name="last_name">
        <a-input
          :value="formData.last_name"
          :placeholder="$t('onboarding.step1.name.lastNamePlaceholder')"
          size="large"
          @input="(e: any) => emit('update:formData', { ...props.formData, last_name: e.target.value })"
        >
          <template #prefix>
            <Icon name="solar:user-bold" size="16" class="text-gray-400" />
          </template>
        </a-input>
      </a-form-item>
    </div>
  </div>
</template>
