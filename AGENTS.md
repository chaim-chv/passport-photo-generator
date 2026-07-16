# AGENTS.md

Instructions for AI agents working on this codebase.

## Project Overview

Passport Photo Generator — a client-side web app using Nuxt 4 + Nuxt UI v4 (Tailwind CSS v4) that lets users create passport-ready photos in their browser. No server uploads; all image processing happens locally via Canvas API, IMG.LY background removal, and jsPDF.

## Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun run build      # Build for production
bun run generate   # Static site generation
bun run preview    # Preview production build
```

## Architecture

- **UI Framework:** Nuxt 4 + Nuxt UI v4 (Tailwind CSS v4)
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
| `assets/css/main.css` | Tailwind CSS v4 + Nuxt UI CSS imports |
| `nuxt.config.ts` | Nuxt config with modules, CSS, and baseURL for GitHub Pages |
| `.github/workflows/deploy.yml` | GitHub Pages static deploy workflow |
| `components/passport/PassportWizard.vue` | Step wizard container with reactive progress indicator |
| `components/passport/StepUpload.vue` | Drag & drop / file picker upload + AI prompt helper |
| `components/passport/StepCrop.vue` | Interactive crop with spec selector, aspect-ratio lock, and face guide |
| `components/passport/StepBackground.vue` | AI background removal with before/after comparison |
| `components/passport/StepPreview.vue` | Final image preview |
| `components/passport/StepDownload.vue` | JPEG/PDF download with result preview (no spec selector) |

### Data Flow

1. User uploads image → `setOriginalImage()` stores as base64 data URL
2. User selects standard and positions crop using drag/zoom with face guide → `updateCropSettings()` tracks scale & offset
3. User confirms → Canvas extracts cropped region accounting for browser implicit scaling → `setCroppedImage()` → goes to background step
4. User optionally removes background → `@imgly/background-removal` processes → `setProcessedImage()`
5. User previews → proceeds to download → Canvas data URL (JPEG) or jsPDF (PDF) using processed or cropped image

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

### Nuxt UI v4 Conventions

- Nuxt UI v4 requires a CSS file importing Tailwind CSS and Nuxt UI (`assets/css/main.css`)
- The app must be wrapped in `<UApp>` (see `app.vue`)
- Button colors use semantic tokens: `primary`, `secondary`, `success`, `info`, `warning`, `error`, `neutral` (not `gray`/`green`/`blue`/`red`)
- USelectMenu uses `:items`, `value-key`, `label-key` (not `:options`, `value-attribute`, `option-attribute`)
- All `rounded-xl` and `rounded-lg` were normalized to `rounded-md`
- No `app.config.ts` — Nuxt UI v4 uses CSS-based theming
- Client-only libraries (jsPDF, IMG.LY) must use dynamic `await import()` to avoid SSR errors

### Adding a New Passport Standard

Edit `utils/passport-specs.ts` and add an entry to the `passportSpecs` array with `widthMm`, `heightMm`, and `dpi`.

### Image Processing Pipeline

```
Raw Image → Canvas (crop at target DPI) → IMG.LY (optional bg removal) → Final Image
                                                    ↓
                                    ┌───────────────┴───────────────┐
                                    ↓                               ↓
                              JPEG Download                   jsPDF → PDF Download
                            (data URL → <a>)              (multi-copy A4 layout)
```
