<script setup lang="ts">
import { computed } from 'vue'
import StepUpload from './StepUpload.vue'
import StepCrop from './StepCrop.vue'
import StepBackground from './StepBackground.vue'
import StepPreview from './StepPreview.vue'
import StepDownload from './StepDownload.vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'

const { state } = usePassportGenerator()

const steps = [
  { key: 'upload' as const, label: 'Upload', icon: 'i-heroicons-cloud-arrow-up' },
  { key: 'crop' as const, label: 'Crop', icon: 'i-heroicons-scissors' },
  { key: 'background' as const, label: 'Background', icon: 'i-heroicons-sparkles' },
  { key: 'preview' as const, label: 'Preview', icon: 'i-heroicons-eye' },
  { key: 'download' as const, label: 'Download', icon: 'i-heroicons-arrow-down-tray' },
]

const currentStepIndex = computed(() => steps.findIndex((s) => s.key === state.step))
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-center gap-0 mb-8">
      <template v-for="(step, i) in steps" :key="step.key">
        <div class="flex items-center gap-1.5">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors"
            :class="
              i < currentStepIndex
                ? 'bg-primary-500 text-white'
                : i === currentStepIndex
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
            "
          >
            <UIcon
              v-if="i < currentStepIndex"
              name="i-heroicons-check"
              class="w-4 h-4"
            />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span
            class="text-xs font-medium hidden sm:inline"
            :class="
              i <= currentStepIndex
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400'
            "
          >
            {{ step.label }}
          </span>
        </div>
        <div
          v-if="i < steps.length - 1"
          class="w-12 sm:w-16 h-0.5 mx-2 rounded transition-colors"
          :class="
            i < currentStepIndex
              ? 'bg-primary-500'
              : 'bg-gray-200 dark:bg-gray-700'
          "
        />
      </template>
    </div>

    <StepUpload v-if="state.step === 'upload'" />
    <StepCrop v-else-if="state.step === 'crop'" />
    <StepBackground v-else-if="state.step === 'background'" />
    <StepPreview v-else-if="state.step === 'preview'" />
    <StepDownload v-else-if="state.step === 'download'" />
  </div>
</template>
