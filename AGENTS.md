# AGENTS.md

Instructions for AI agents working on this codebase.

## Project Overview

Passport Photo Generator — a client-side web app using Nuxt 3 + Nuxt UI that lets users create passport-ready photos in their browser. No server uploads; all image processing happens locally via Canvas API, IMG.LY background removal, and jsPDF.

## Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun run build      # Build for production
bun run generate   # Static site generation
bun run preview    # Preview production build
```

## Architecture

- **UI Framework:** Nuxt 3 + Nuxt UI v2 (Tailwind CSS)
- **State Management:** Shared composable `usePassportGenerator()` using Vue `reactive()`
- **Image Processing:** Canvas API (client-side crop & resize)
- **Background Removal:** IMG.LY (`@imgly/background-removal`) — loaded via dynamic import, on-device only
- **PDF Generation:** jsPDF (client-side, dynamic import)
- **Package Manager:** Bun

### Key Files

| Path | Purpose |
|------|---------|
| `composables/usePassportGenerator.ts` | Central reactive state for the 5-step wizard flow |
| `utils/passport-specs.ts` | Passport dimension specs and conversion helpers |
| `types/passport.ts` | TypeScript interfaces |
| `components/passport/PassportWizard.vue` | Step wizard container with progress indicator |
| `components/passport/StepUpload.vue` | Drag & drop / file picker upload + spec selector |
| `components/passport/StepCrop.vue` | Interactive image cropper with aspect-ratio lock and face guide overlay |
| `components/passport/StepBackground.vue` | AI background removal with before/after comparison |
| `components/passport/StepPreview.vue` | Final image preview |
| `components/passport/StepDownload.vue` | JPEG download and PDF generation |

### Data Flow

1. User selects passport standard and uploads image → `setOriginalImage()` stores as base64 data URL
2. User positions crop using drag/zoom with face guide → `updateCropSettings()` tracks scale & offset
3. User confirms → Canvas extracts cropped region accounting for browser implicit scaling → `setCroppedImage()`
4. User optionally removes background → `@imgly/background-removal` processes → `setProcessedImage()`
5. User downloads → Canvas data URL (JPEG) or jsPDF (PDF) using processed or cropped image

### Image Crop Math

The crop component must account for **two levels of scaling**:
1. **Browser implicit scaling** — the `<img>` element is constrained by its container (`offsetWidth ≠ naturalWidth`)
2. **CSS transform scale** — the user's zoom level applied via `transform: scale()`

The effective scale is `(offsetWidth / naturalWidth) × (zoom / 100)`. All coordinate mapping between container space and original image space must use this combined scale.

Key functions in `StepCrop.vue`:
- `getLayoutSize()` — returns the image's layout dimensions (`offsetWidth × offsetHeight`)
- `recalcSizes()` — computes crop frame size, min/initial zoom using layout dimensions
- `initPosition()` / `clampOffset()` — position and constrain using layout × transform scale
- `confirmCrop()` — extracts the cropped region using the combined scale

### Adding a New Passport Standard

Edit `utils/passport-specs.ts` and add an entry to the `passportSpecs` array with `widthMm`, `heightMm`, and `dpi`.

### Design Conventions

- Use Nuxt UI components (UButton, UCard, USelectMenu, UIcon, etc.) — they are auto-imported
- Icons use the `i-heroicons-*` prefix (Heroicons via Iconify)
- Tailwind utility classes for styling; use `primary` color tokens for brand
- Dark mode is supported automatically via Nuxt UI's `dark` class strategy
- Keep components self-contained with `<script setup lang="ts">`
- Subdirectory components need explicit imports (Nuxt prefixes them with folder name)
- Client-only libraries (jsPDF, IMG.LY) must use dynamic `await import()` to avoid SSR errors

### Image Processing Pipeline

```
Raw Image → Canvas (crop at target DPI) → IMG.LY (optional bg removal) → Final Image
                                                    ↓
                                    ┌───────────────┴───────────────┐
                                    ↓                               ↓
                              JPEG Download                   jsPDF → PDF Download
                            (data URL → <a>)              (multi-copy A4 layout)
```
