<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'

const { setOriginalImage } = usePassportGenerator()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const error = ref<string | null>(null)
const aiSectionOpen = ref(false)
const gender = ref<'male' | 'female'>('male')
const copied = ref(false)

const aiPrompt = computed(() => {
  const clothing = gender.value === 'male' ? 'a white shirt' : 'a modest blouse or professional attire'
  return `Strictly following the facial features and likeness of the uploaded images, generate a professional, photorealistic passport-style portrait. The person should wear ${clothing}. The background must be solid, clean, and pure white (#FFFFFF). Ensure a neutral expression, even lighting with no shadows, and standard passport dimensions (2x2 inches or 35x45mm).`
})

async function copyPrompt() {
  try {
    await navigator.clipboard.writeText(aiPrompt.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback
  }
}

function handleFile(file: File) {
  error.value = null

  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file.'
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    error.value = 'File size must be under 20 MB.'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    setOriginalImage(dataUrl, file)
  }
  reader.readAsDataURL(file)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  input.value = ''
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function openFileDialog() {
  fileInput.value?.click()
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-8">
    <div class="text-center space-y-2">
      <h2 class="text-2xl font-semibold">Upload Your Photo</h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-md">
        Choose a clear, front-facing photo with even lighting and a plain
        background.
      </p>
    </div>

    <div
      class="w-full max-w-lg rounded-md border-2 border-dashed p-12 text-center cursor-pointer transition-colors"
      :class="
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
      "
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @click="openFileDialog"
      role="button"
      tabindex="0"
      @keydown.enter="openFileDialog"
      @keydown.space.prevent="openFileDialog"
    >
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-heroicons-cloud-arrow-up" class="w-12 h-12 text-gray-400" />
        <p class="text-sm font-medium">
          Drag & drop your photo here, or
          <span class="text-primary-600 dark:text-primary-400 underline">browse</span>
        </p>
        <p class="text-xs text-gray-400">JPEG, PNG, WebP &middot; max 20 MB</p>
      </div>
    </div>

    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />

    <div
      v-if="error"
      class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 px-4 py-2 rounded-md"
    >
      {{ error }}
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-5 max-w-lg w-full">
      <h3 class="text-sm font-semibold mb-3 flex items-center gap-1.5">
        <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 text-amber-500" />
        Tips for a good passport photo
      </h3>
      <ul class="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 list-disc list-inside">
        <li>Face the camera directly with a neutral expression</li>
        <li>Use a plain white or light-colored background</li>
        <li>Ensure even lighting, no shadows on your face</li>
        <li>Keep both eyes open and visible</li>
        <li>Avoid head coverings (unless religious/medical)</li>
      </ul>
    </div>

    <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-md p-5 max-w-lg w-full border border-purple-200 dark:border-purple-800">
      <button
        class="w-full flex items-center justify-between gap-2 text-left"
        @click="aiSectionOpen = !aiSectionOpen"
      >
        <h3 class="text-sm font-semibold flex items-center gap-1.5">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-purple-500" />
          Generate a Photo with AI
        </h3>
        <UIcon
          :name="aiSectionOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-4 h-4 text-gray-400"
        />
      </button>

      <div v-if="aiSectionOpen" class="mt-4 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Don't have a suitable photo? Use an AI image generator to create one. Upload a few
            photos of yourself to the AI, then use the prompt below.
        </p>

        <div class="flex items-center gap-3">
          <span class="text-xs font-medium text-gray-500">Clothing style:</span>
          <div class="flex rounded-md bg-white dark:bg-gray-700 p-0.5 gap-0.5 shadow-sm">
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              :class="
                gender === 'male'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="gender = 'male'"
            >
              Men
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              :class="
                gender === 'female'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="gender = 'female'"
            >
              Women
            </button>
          </div>
        </div>

        <div class="relative">
          <pre
            class="text-xs text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap leading-relaxed"
          >{{ aiPrompt }}</pre>
          <UButton
            size="xs"
            :color="copied ? 'success' : 'neutral'"
            class="absolute top-2 right-2"
            @click="copyPrompt"
          >
            <UIcon
              :name="copied ? 'i-heroicons-check' : 'i-heroicons-clipboard'"
              class="w-3.5 h-3.5"
            />
            {{ copied ? 'Copied' : 'Copy' }}
          </UButton>
        </div>

        <div class="text-xs text-gray-400 space-y-1">
          <p><strong class="text-gray-500">How to use:</strong></p>
          <ol class="list-decimal list-inside space-y-0.5">
            <li>Upload 2–3 clear photos of your face to an AI image generator</li>
            <li>Copy and paste the prompt above</li>
            <li>Download the generated image and upload it here</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
