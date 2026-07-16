<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'

const { state, setProcessedImage, skipBackground, setStep } = usePassportGenerator()

const processing = ref(false)
const progress = ref(0)
const errorMessage = ref<string | null>(null)
const showResult = ref(false)

function getDisplayImage(): string {
  return state.croppedImage ?? ''
}

async function removeBackground() {
  if (!state.croppedImage) return

  processing.value = true
  errorMessage.value = null
  progress.value = 0

  try {
    const { removeBackground } = await import('@imgly/background-removal')

    const blob = await removeBackground(state.croppedImage, {
      progress: (key: string, current: number, total: number) => {
        progress.value = Math.round((current / total) * 100)
      },
    })

    const img = new Image()
    const dataUrl = await new Promise<string>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(state.croppedImage!)

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      img.src = URL.createObjectURL(blob)
    })

    setProcessedImage(dataUrl)
    showResult.value = true
  } catch (e: any) {
    errorMessage.value = e?.message || 'Background removal failed. You can skip this step.'
  } finally {
    processing.value = false
  }
}

function confirmAndContinue() {
  if (!state.processedImage) return
  setStep('preview')
}

function handleSkip() {
  skipBackground()
}

function goBack() {
  setStep('crop')
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-6">
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold">Background Removal</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Remove the background and replace it with white for a clean passport
        photo. This step is optional.
      </p>
    </div>

    <div
      v-if="!processing && !showResult"
      class="flex flex-col items-center gap-4"
    >
      <div
        class="bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden max-w-xs"
      >
        <img
          :src="getDisplayImage()"
          class="w-full h-auto object-cover"
          alt="Cropped photo"
        />
      </div>

      <div class="flex gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleSkip"
        >
          Skip & Keep Original
        </UButton>
        <UButton @click="removeBackground"> Remove Background </UButton>
      </div>
    </div>

    <div
      v-if="processing"
      class="flex flex-col items-center gap-4 py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 text-primary-500 animate-spin"
      />
      <p class="text-sm text-gray-500">
        Processing image... {{ progress }}%
      </p>
      <UProgress
        :value="progress"
        size="sm"
        class="w-48"
      />
      <p class="text-xs text-gray-400">
        Running locally on your device. May take a few moments.
      </p>
    </div>

    <div
      v-if="errorMessage"
      class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-4 py-2 rounded-md max-w-sm text-center"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="showResult && state.processedImage"
      class="flex flex-col items-center gap-4"
    >
      <p class="text-sm font-medium text-green-600 dark:text-green-400">
        Background removed successfully!
      </p>

      <div class="grid grid-cols-2 gap-4 max-w-md">
        <div class="space-y-1 text-center">
          <p class="text-xs text-gray-400">Before</p>
          <div
            class="bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
          >
            <img
              :src="state.croppedImage!"
              class="w-full h-auto object-cover"
              alt="Before"
            />
          </div>
        </div>
        <div class="space-y-1 text-center">
          <p class="text-xs text-gray-400">After</p>
          <div
            class="bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
          >
            <img
              :src="state.processedImage"
              class="w-full h-auto object-cover"
              alt="After"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleSkip"
        >
          Discard & Use Original
        </UButton>
        <UButton @click="confirmAndContinue"> Looks Good, Continue </UButton>
      </div>
    </div>

    <div v-if="!processing || showResult">
      <UButton
        color="neutral"
        variant="ghost"
        @click="goBack"
      >
        Back to Crop
      </UButton>
    </div>
  </div>
</template>
