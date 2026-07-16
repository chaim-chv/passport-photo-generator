import type { PassportSpec, PdfLayout } from '../types/passport'

export const passportSpecs: PassportSpec[] = [
  {
    id: 'standard-35x45',
    label: 'Standard 35×45 mm',
    description: 'EU, China, India, Australia, and many other countries',
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
  },
  {
    id: 'us-2x2',
    label: 'US 2×2 inch (51×51 mm)',
    description: 'United States passport & visa photos',
    widthMm: 51,
    heightMm: 51,
    dpi: 300,
  },
  {
    id: 'uk-35x45',
    label: 'UK 35×45 mm',
    description: 'United Kingdom passport photos',
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
  },
  {
    id: 'canada-50x70',
    label: 'Canada 50×70 mm',
    description: 'Canadian passport photos',
    widthMm: 50,
    heightMm: 70,
    dpi: 300,
  },
]

export const pdfLayouts: PdfLayout[] = [
  { id: '2x2', label: '4 copies (2×2)', cols: 2, rows: 2 },
  { id: '3x2', label: '6 copies (3×2)', cols: 3, rows: 2 },
  { id: '4x2', label: '8 copies (4×2)', cols: 4, rows: 2 },
]

export function getPassportSpec(id: string): PassportSpec {
  return passportSpecs.find((s) => s.id === id) ?? passportSpecs[0]
}

export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi)
}

export function getTargetDimensions(spec: PassportSpec): { width: number; height: number } {
  return {
    width: mmToPixels(spec.widthMm, spec.dpi),
    height: mmToPixels(spec.heightMm, spec.dpi),
  }
}
