import { reactive, computed } from 'vue'
import type { WizardStep, CropSettings } from '../types/passport'
import { passportSpecs, getPassportSpec, getTargetDimensions, mmToPixels } from '../utils/passport-specs'

const state = reactive({
  step: 'upload' as WizardStep,
  originalImage: null as string | null,
  originalImageFile: null as File | null,
  croppedImage: null as string | null,
  processedImage: null as string | null,
  selectedSpecId: passportSpecs[0].id,
  cropSettings: { scale: 1, offsetX: 0, offsetY: 0 } as CropSettings,
})

const selectedSpec = computed(() => getPassportSpec(state.selectedSpecId))

const targetDimensions = computed(() => getTargetDimensions(selectedSpec.value))

export function usePassportGenerator() {
  function setStep(step: WizardStep) {
    state.step = step
  }

  function setOriginalImage(dataUrl: string, file: File) {
    state.originalImage = dataUrl
    state.originalImageFile = file
    state.croppedImage = null
    state.processedImage = null
    state.cropSettings = { scale: 1, offsetX: 0, offsetY: 0 }
    state.step = 'crop'
  }

  function setCroppedImage(dataUrl: string) {
    state.croppedImage = dataUrl
    state.processedImage = null
    state.step = 'background'
  }

  function setProcessedImage(dataUrl: string) {
    state.processedImage = dataUrl
    state.step = 'preview'
  }

  function skipBackground() {
    state.processedImage = null
    state.step = 'preview'
  }

  function updateCropSettings(settings: CropSettings) {
    state.cropSettings = { ...settings }
  }

  function setSpec(specId: string) {
    state.selectedSpecId = specId
    if (state.croppedImage) {
      state.croppedImage = null
      state.step = 'crop'
    }
  }

  function reset() {
    state.step = 'upload'
    state.originalImage = null
    state.originalImageFile = null
    state.croppedImage = null
    state.processedImage = null
    state.selectedSpecId = passportSpecs[0].id
    state.cropSettings = { scale: 1, offsetX: 0, offsetY: 0 }
  }

  return {
    state,
    selectedSpec,
    targetDimensions,
    setStep,
    setOriginalImage,
    setCroppedImage,
    setProcessedImage,
    skipBackground,
    updateCropSettings,
    setSpec,
    reset,
  }
}
