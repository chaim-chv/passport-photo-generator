export interface PassportSpec {
  id: string
  label: string
  description: string
  widthMm: number
  heightMm: number
  dpi: number
}

export interface CropSettings {
  scale: number
  offsetX: number
  offsetY: number
}

export type WizardStep = 'upload' | 'crop' | 'background' | 'preview' | 'download'

export interface PdfLayout {
  id: string
  label: string
  cols: number
  rows: number
}

export interface GeneratorState {
  step: WizardStep
  originalImage: string | null
  originalImageFile: File | null
  croppedImage: string | null
  processedImage: string | null
  selectedSpecId: string
  cropSettings: CropSettings
}
