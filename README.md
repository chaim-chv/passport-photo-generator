# Passport Photo Generator

A web application to create passport-ready photos directly in your browser. Upload a photo, crop it to the correct proportions, optionally remove the background with AI, and download as a single image or a printable PDF with multiple copies.

**All processing happens locally — your photos never leave your device.**

## Features

- Upload photos via drag & drop or file picker
- Interactive crop tool with passport aspect ratio lock and face positioning guide
- Supports multiple international passport photo standards:
  - Standard 35×45 mm (EU, China, India, Australia, etc.)
  - US 2×2 inch (51×51 mm)
  - UK 35×45 mm
  - Canada 50×70 mm
- Optional AI background removal (on-device, powered by IMG.LY)
- Real-time zoom and position controls with head guide overlay
- Download as a single high-resolution JPEG
- Download as a printable A4 PDF with multiple copies and cut guides
- Fully client-side processing — privacy first

## Getting Started

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun run build      # Build for production
bun run generate   # Static site generation
bun run preview    # Preview production build
```

## Tech Stack

- [Nuxt 3](https://nuxt.com) — Vue framework
- [Nuxt UI](https://ui.nuxt.com) — Component library
- [IMG.LY Background Removal](https://img.ly/) — On-device AI background removal
- [jsPDF](https://github.com/parallax/jsPDF) — Client-side PDF generation
- [Bun](https://bun.sh) — JavaScript runtime & package manager

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` — the included workflow will build and deploy automatically.

The workflow generates a static site with the correct base URL for your repo name (e.g. `/passport-image-generator/`). No manual configuration needed.

### Manual deployment

```bash
bun run generate
# Set the base URL for a project site (not username.github.io):
# NUXT_APP_BASE_URL=/your-repo-name/ bun run generate
```

Then deploy the `.output/public` directory to any static host.

## How It Works

1. **Upload** — Select a photo and choose your passport standard.
2. **Crop** — Drag and zoom to position your face within the guide frame. Corner markers and a head/chin guide help with alignment.
3. **Background** — Optionally remove the background with AI. Before/after comparison shown side by side.
4. **Preview** — Review the final result at the target resolution.
5. **Download** — Single JPEG or multi-copy PDF with cut guides.

## Project Structure

```
├── app.vue                          # Root layout
├── app.config.ts                    # Nuxt UI theme config
├── nuxt.config.ts                   # Nuxt configuration
├── composables/
│   └── usePassportGenerator.ts      # Shared state & logic
├── components/
│   └── passport/
│       ├── PassportWizard.vue       # 5-step wizard shell
│       ├── StepUpload.vue           # Upload + spec selector
│       ├── StepCrop.vue             # Interactive crop with face guide
│       ├── StepBackground.vue       # AI background removal
│       ├── StepPreview.vue          # Final preview
│       └── StepDownload.vue         # JPEG + PDF download
├── types/
│   └── passport.ts                  # TypeScript types
└── utils/
    └── passport-specs.ts            # Passport standards & helpers
```
