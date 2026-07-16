<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { usePassportGenerator } from '../../composables/usePassportGenerator'
import { passportSpecs, getTargetDimensions } from '../../utils/passport-specs'

const { state, selectedSpec, targetDimensions, updateCropSettings, setCroppedImage, setStep, setSpec } =
  usePassportGenerator()

const containerRef = ref<HTMLDivElement>()
const imgRef = ref<HTMLImageElement>()
const imgNatural = ref({ width: 0, height: 0 })

const zoom = ref(100)
const dragging = ref(false)
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })

const containerSize = ref({ width: 0, height: 0 })
const cropFrameSize = ref({ width: 0, height: 0 })

const minZoom = ref(10)
const maxZoom = ref(300)

function getLayoutSize() {
  if (!imgRef.value) return { w: imgNatural.value.width, h: imgNatural.value.height }
  return { w: imgRef.value.offsetWidth, h: imgRef.value.offsetHeight }
}

function recalcSizes() {
  if (!containerRef.value || !imgNatural.value.width) return

  const cw = containerRef.value.clientWidth
  const ch = containerRef.value.clientHeight
  containerSize.value = { width: cw, height: ch }

  const ratio = selectedSpec.value.widthMm / selectedSpec.value.heightMm
  const maxCropW = cw - 40
  const maxCropH = ch - 40

  let cropW: number, cropH: number
  if (maxCropW / ratio <= maxCropH) {
    cropW = maxCropW
    cropH = maxCropW / ratio
  } else {
    cropH = maxCropH
    cropW = maxCropH * ratio
  }

  cropFrameSize.value = { width: cropW, height: cropH }

  const layout = getLayoutSize()
  const minScaleX = cropW / layout.w
  const minScaleY = cropH / layout.h
  const minScale = Math.max(minScaleX, minScaleY)
  minZoom.value = Math.round(minScale * 100)

  if (zoom.value < minZoom.value) {
    zoom.value = minZoom.value
  }

  const fitScale = Math.min(cw / layout.w, ch / layout.h)
  if (zoom.value === 100 && fitScale < 1) {
    zoom.value = Math.round(fitScale * 100)
  }
}

const scale = computed(() => zoom.value / 100)

const cropLeft = computed(() => (containerSize.value.width - cropFrameSize.value.width) / 2)
const cropTop = computed(() => (containerSize.value.height - cropFrameSize.value.height) / 2)

const imageTransform = computed(() => {
  return `translate(${state.cropSettings.offsetX}px, ${state.cropSettings.offsetY}px) scale(${scale.value})`
})

function initPosition() {
  if (!containerRef.value || !imgNatural.value.width) return

  const cw = containerSize.value.width
  const ch = containerSize.value.height
  const layout = getLayoutSize()

  const s = scale.value
  const displayW = layout.w * s
  const displayH = layout.h * s

  const ox = (cw - displayW) / 2
  const oy = (ch - displayH) / 2

  state.cropSettings.offsetX = ox
  state.cropSettings.offsetY = oy
  state.cropSettings.scale = s
}

function clampOffset() {
  const layout = getLayoutSize()
  const displayW = layout.w * scale.value
  const displayH = layout.h * scale.value
  const cl = cropLeft.value
  const ct = cropTop.value
  const cr = cl + cropFrameSize.value.width
  const cb = ct + cropFrameSize.value.height

  let ox = state.cropSettings.offsetX
  let oy = state.cropSettings.offsetY

  ox = Math.min(ox, cl)
  ox = Math.max(ox, cr - displayW)
  oy = Math.min(oy, ct)
  oy = Math.max(oy, cb - displayH)

  state.cropSettings.offsetX = ox
  state.cropSettings.offsetY = oy
}

function onMouseDown(e: MouseEvent) {
  e.preventDefault()
  dragging.value = true
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    offsetX: state.cropSettings.offsetX,
    offsetY: state.cropSettings.offsetY,
  }
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  state.cropSettings.offsetX = dragStart.value.offsetX + dx
  state.cropSettings.offsetY = dragStart.value.offsetY + dy
  clampOffset()
}

function onMouseUp() {
  dragging.value = false
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return
  e.preventDefault()
  const t = e.touches[0]
  dragging.value = true
  dragStart.value = {
    x: t.clientX,
    y: t.clientY,
    offsetX: state.cropSettings.offsetX,
    offsetY: state.cropSettings.offsetY,
  }
}

function onTouchMove(e: TouchEvent) {
  if (!dragging.value || e.touches.length !== 1) return
  const t = e.touches[0]
  const dx = t.clientX - dragStart.value.x
  const dy = t.clientY - dragStart.value.y
  state.cropSettings.offsetX = dragStart.value.offsetX + dx
  state.cropSettings.offsetY = dragStart.value.offsetY + dy
  clampOffset()
}

function onTouchEnd() {
  dragging.value = false
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -5 : 5
  setZoom(zoom.value + delta)
}

function setZoom(newZoom: number) {
  const prevZoom = zoom.value
  zoom.value = Math.min(maxZoom.value, Math.max(minZoom.value, newZoom))

  if (zoom.value === prevZoom) return

  const centerX = cropLeft.value + cropFrameSize.value.width / 2
  const centerY = cropTop.value + cropFrameSize.value.height / 2

  const prevScale = prevZoom / 100
  const newScale = zoom.value / 100

  state.cropSettings.offsetX = centerX - (centerX - state.cropSettings.offsetX) * (newScale / prevScale)
  state.cropSettings.offsetY = centerY - (centerY - state.cropSettings.offsetY) * (newScale / prevScale)
  state.cropSettings.scale = newScale
  clampOffset()
}

function onImageLoad() {
  if (imgRef.value) {
    imgNatural.value = {
      width: imgRef.value.naturalWidth,
      height: imgRef.value.naturalHeight,
    }
    nextTick(() => {
      recalcSizes()
      initPosition()
    })
  }
}

function confirmCrop() {
  if (!state.originalImage || !imgNatural.value.width || !imgRef.value) return

  const s = scale.value
  const ox = state.cropSettings.offsetX
  const oy = state.cropSettings.offsetY
  const cl = cropLeft.value
  const ct = cropTop.value
  const cw = cropFrameSize.value.width
  const ch = cropFrameSize.value.height

  const layoutW = imgRef.value.offsetWidth
  const layoutH = imgRef.value.offsetHeight
  const baseScaleX = layoutW / imgNatural.value.width
  const baseScaleY = layoutH / imgNatural.value.height

  const dims = getTargetDimensions(selectedSpec.value)
  const canvas = document.createElement('canvas')
  canvas.width = dims.width
  canvas.height = dims.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    const sx = (cl - ox) / (s * baseScaleX)
    const sy = (ct - oy) / (s * baseScaleY)
    const sw = cw / (s * baseScaleX)
    const sh = ch / (s * baseScaleY)

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, dims.width, dims.height)
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dims.width, dims.height)

    setCroppedImage(canvas.toDataURL('image/jpeg', 0.92))
  }
  img.src = state.originalImage
}

function goBack() {
  setStep('upload')
}

let resizeObs: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObs = new ResizeObserver(() => {
      recalcSizes()
      clampOffset()
    })
    resizeObs.observe(containerRef.value)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('touchmove', onTouchMove, { passive: false })
  document.addEventListener('touchend', onTouchEnd)
  if (imgRef.value && imgRef.value.complete && imgRef.value.naturalWidth > 0) {
    onImageLoad()
  }
})

onUnmounted(() => {
  resizeObs?.disconnect()
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('touchmove', onTouchMove)
  document.removeEventListener('touchend', onTouchEnd)
})

watch(
  () => state.originalImage,
  () => {
    imgNatural.value = { width: 0, height: 0 }
    zoom.value = 100
    nextTick(() => recalcSizes())
  },
)

watch(selectedSpec, () => {
  if (imgNatural.value.width > 0 && containerRef.value) {
    nextTick(() => {
      recalcSizes()
      initPosition()
      clampOffset()
    })
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-4">
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold">Position Your Photo</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        Drag the image to center your face in the frame. Use the slider or
        scroll to zoom.
      </p>
    </div>

    <div class="w-full max-w-sm space-y-1.5">
      <label class="text-xs font-medium text-gray-500 uppercase tracking-wide">Passport Standard</label>
      <USelectMenu
        :model-value="state.selectedSpecId"
        :items="passportSpecs.map((s) => ({ label: s.label, value: s.id, description: s.description }))"
        value-key="value"
        label-key="label"
        @update:model-value="setSpec"
        size="sm"
        class="w-full"
      />
    </div>

    <div class="flex items-center gap-2 mb-1">
      <UIcon name="i-heroicons-magnifying-glass-minus" class="w-4 h-4 text-gray-400" />
      <input
        type="range"
        :min="minZoom"
        :max="maxZoom"
        :value="zoom"
        class="w-48 h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-gray-700 accent-primary-500 cursor-pointer"
        @input="setZoom(Number(($event.target as HTMLInputElement).value))"
      />
      <UIcon name="i-heroicons-magnifying-glass-plus" class="w-4 h-4 text-gray-400" />
      <span class="text-xs text-gray-400 w-10 text-right">{{ zoom }}%</span>
    </div>

    <div
      ref="containerRef"
      class="relative w-full max-w-lg overflow-hidden rounded-md bg-gray-900 select-none touch-none"
      :style="{ height: '500px' }"
      @mousedown="onMouseDown"
      @touchstart.prevent="onTouchStart"
      @wheel.prevent="onWheel"
    >
      <img
        v-if="state.originalImage"
        ref="imgRef"
        :src="state.originalImage"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: imageTransform,
          transformOrigin: '0 0',
          pointerEvents: 'none',
        }"
        :draggable="false"
        @load="onImageLoad"
      />

      <div
        v-if="cropFrameSize.width"
        class="absolute border-2 border-dashed border-white/80 pointer-events-none"
        :style="{
          left: cropLeft + 'px',
          top: cropTop + 'px',
          width: cropFrameSize.width + 'px',
          height: cropFrameSize.height + 'px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
          borderRadius: '2px',
        }"
      >
        <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-white/60 text-[10px] whitespace-nowrap font-mono">
          {{ selectedSpec.widthMm }}×{{ selectedSpec.heightMm }} mm
        </div>
        <div
          class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl"
        />
        <div
          class="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr"
        />
        <div
          class="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl"
        />
        <div
          class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white rounded-br"
        />

        <svg
          class="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <ellipse
            cx="50"
            cy="45"
            rx="22"
            ry="32"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            stroke-width="1.5"
            stroke-dasharray="4 3"
          />
          <line
            x1="18"
            y1="62"
            x2="82"
            y2="62"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="0.5"
          />
          <line
            x1="40"
            y1="15"
            x2="60"
            y2="15"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="0.5"
          />
        </svg>
      </div>
    </div>

    <div class="flex gap-3">
      <UButton color="neutral" variant="ghost" @click="goBack">Back</UButton>
      <UButton @click="confirmCrop"> Confirm Crop </UButton>
    </div>
  </div>
</template>
