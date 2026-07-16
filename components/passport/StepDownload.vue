<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'
import { pdfLayouts } from '../../utils/passport-specs'
import type { PdfLayout } from '../../types/passport'

const { state, selectedSpec, targetDimensions, setStep, reset } = usePassportGenerator()

const allLayouts = pdfLayouts

const availableLayouts = computed(() =>
  allLayouts.filter((l) => {
    const totalW = selectedSpec.value.widthMm * l.cols + 4 * (l.cols - 1)
    const totalH = selectedSpec.value.heightMm * l.rows + 4 * (l.rows - 1)
    return totalW <= 210 && totalH <= 297
  }),
)

const selectedLayoutId = ref(availableLayouts.value[0]?.id ?? allLayouts[0].id)
const activeTab = ref<'image' | 'pdf'>('pdf')
const generatingPdf = ref(false)

const selectedLayout = ref<PdfLayout>(availableLayouts.value[0])

const downloadImage = computed(() => state.processedImage || state.croppedImage)

function onLayoutChange(id: string) {
  selectedLayoutId.value = id
  selectedLayout.value = availableLayouts.value.find((l) => l.id === id) ?? availableLayouts.value[0]
}

function downloadImageFile() {
  const imgData = downloadImage.value
  if (!imgData) return

  const link = document.createElement('a')
  link.download = `passport-photo-${selectedSpec.value.widthMm}x${selectedSpec.value.heightMm}mm.jpg`
  link.href = imgData
  link.click()
}

async function generatePdf() {
  const imgData = downloadImage.value
  if (!imgData) return

  generatingPdf.value = true

  const { jsPDF } = await import('jspdf')

  const layout = selectedLayout.value
  const spec = selectedSpec.value
  const spacing = 4
  const marginLeft = (210 - (spec.widthMm * layout.cols + spacing * (layout.cols - 1))) / 2
  const marginTop = (297 - (spec.heightMm * layout.rows + spacing * (layout.rows - 1))) / 2

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const x = marginLeft + col * (spec.widthMm + spacing)
      const y = marginTop + row * (spec.heightMm + spacing)

      doc.setDrawColor(200)
      doc.setLineDashPattern([2, 2], 0)
      doc.rect(x - 0.5, y - 0.5, spec.widthMm + 1, spec.heightMm + 1)

      doc.addImage(imgData, 'JPEG', x, y, spec.widthMm, spec.heightMm)

      doc.setLineDashPattern([], 0)
      doc.setDrawColor(220)
      doc.rect(x, y, spec.widthMm, spec.heightMm)
    }
  }

  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text(
    `Passport photo ${spec.widthMm}×${spec.heightMm} mm · ${layout.label} · Cut along dashed lines`,
    marginLeft,
    marginTop + spec.heightMm * layout.rows + spacing * (layout.rows - 1) + 6,
  )

  doc.save(`passport-photos-${spec.widthMm}x${spec.heightMm}mm-${layout.id}.pdf`)

  generatingPdf.value = false
}

function startOver() {
  reset()
}

function goBack() {
  setStep('preview')
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 py-6 max-w-lg mx-auto w-full">
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold">Download</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Choose format and download your passport photo.
      </p>
    </div>

    <div
      v-if="downloadImage"
      class="bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden w-32"
      :style="{ aspectRatio: selectedSpec.widthMm / selectedSpec.heightMm }"
    >
      <img :src="downloadImage" class="w-full h-full object-cover" alt="Result preview" />
    </div>

    <div class="text-xs text-gray-400 text-center">
      {{ selectedSpec.label }} &middot;
      {{ targetDimensions.width }}×{{ targetDimensions.height }} px &middot;
      {{ selectedSpec.dpi }} DPI
    </div>

    <div class="w-full space-y-4">
      <div class="flex rounded-md bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        <button
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'pdf'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeTab = 'pdf'"
        >
          <UIcon name="i-heroicons-document" class="w-4 h-4 inline mr-1" />
          PDF for Print
        </button>
        <button
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === 'image'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeTab = 'image'"
        >
          <UIcon name="i-heroicons-photo" class="w-4 h-4 inline mr-1" />
          Single Image
        </button>
      </div>

      <div v-if="activeTab === 'pdf'" class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >Copies per Sheet</label
          >
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="layout in availableLayouts"
              :key="layout.id"
              :class="[
                'py-2 px-3 text-sm rounded-md border transition-colors',
                selectedLayoutId === layout.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300',
              ]"
              @click="onLayoutChange(layout.id)"
            >
              {{ layout.label }}
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-sm text-gray-500 space-y-1.5">
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Paper size:</strong> A4 (210×297 mm)
          </p>
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Photo size:</strong>
            {{ selectedSpec.widthMm }}×{{ selectedSpec.heightMm }} mm at {{ selectedSpec.dpi }} DPI
          </p>
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Layout:</strong>
            {{ selectedLayout.cols }}×{{ selectedLayout.rows }} = {{ selectedLayout.cols * selectedLayout.rows }}
            photos
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Print on A4 photo paper at 100% scale. Cut along the dashed lines.
          </p>
        </div>

        <UButton
          block
          size="lg"
          :loading="generatingPdf"
          @click="generatePdf"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
          Download PDF
        </UButton>
      </div>

      <div v-if="activeTab === 'image'" class="space-y-4">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-md p-4 text-sm text-gray-500 space-y-1.5">
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Dimensions:</strong>
            {{ targetDimensions.width }}×{{ targetDimensions.height }} px
          </p>
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Print size:</strong>
            {{ selectedSpec.widthMm }}×{{ selectedSpec.heightMm }} mm at {{ selectedSpec.dpi }} DPI
          </p>
          <p>
            <strong class="text-gray-700 dark:text-gray-300">Format:</strong>
            JPEG
          </p>
        </div>

        <UButton block size="lg" @click="downloadImageFile">
          <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
          Download Image
        </UButton>
      </div>
    </div>

    <div class="flex gap-3 pt-2">
      <UButton color="neutral" variant="ghost" @click="goBack"> Back </UButton>
      <UButton color="neutral" variant="ghost" @click="startOver"> Start Over </UButton>
    </div>
  </div>
</template>
