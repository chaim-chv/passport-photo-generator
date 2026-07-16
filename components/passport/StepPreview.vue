<script setup lang="ts">
import { computed } from 'vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'

const { state, selectedSpec, targetDimensions, setStep } = usePassportGenerator()

const displayImage = computed(() => state.processedImage || state.croppedImage)

function goBack() {
  setStep(state.processedImage ? 'background' : 'crop')
}

function recrop() {
  state.processedImage = null
  setStep('crop')
}

function retryBackground() {
  state.processedImage = null
  setStep('background')
}

function proceedToDownload() {
  setStep('download')
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-6">
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold">Preview</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ selectedSpec.label }} &middot;
        {{ targetDimensions.width }}×{{ targetDimensions.height }} px at {{ selectedSpec.dpi }} DPI
      </p>
    </div>

    <div
      v-if="displayImage"
      class="relative bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden"
      :style="{
        width: Math.min(targetDimensions.width, 300) + 'px',
        maxWidth: '100%',
        aspectRatio: selectedSpec.widthMm / selectedSpec.heightMm,
      }"
    >
      <img :src="displayImage" class="w-full h-full object-cover" alt="Passport photo preview" />
    </div>

    <div v-else class="text-gray-400 py-16">
      <UIcon name="i-heroicons-photo" class="w-16 h-16 mx-auto mb-2" />
      <p class="text-sm">No cropped image yet.</p>
    </div>

    <div class="flex gap-3">
      <UButton color="neutral" variant="ghost" @click="recrop"> Re-crop </UButton>
      <UButton
        v-if="state.processedImage"
        color="neutral"
        variant="ghost"
        @click="retryBackground"
      >
        Re-do Background
      </UButton>
      <UButton @click="proceedToDownload"> Looks Good, Continue </UButton>
    </div>
  </div>
</template>
