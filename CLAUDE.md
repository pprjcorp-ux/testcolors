# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuraCor is a Next.js 16 personal color analysis app (coloracao pessoal) implementing the **12-season color theory**:
- 4 main seasons (Primavera, Verao, Outono, Inverno) x 3 sub-variations each
- Two analysis methods: questionnaire-based and AI photo analysis (GPT-4o Vision)

**Language:** All UI and content is in Portuguese (pt-BR).

## Commands

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm start            # Run production server
npm run lint         # ESLint
npm test             # Run Jest tests
npm run test:watch   # Jest watch mode
```

## Directory Structure

```
testcolors/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (ThemeProvider, fonts, metadata)
│   ├── page.tsx                  # Home page with hero section
│   ├── globals.css               # Global styles, CSS variables, animations
│   ├── questionario/page.tsx     # 10-question analysis flow
│   ├── analise-foto/page.tsx     # Photo upload for AI analysis
│   ├── resultado/page.tsx        # Results display with export options
│   └── api/analyze/route.ts      # GPT-4o Vision API endpoint
├── components/                   # React components
│   ├── Header.tsx                # Navigation (DO NOT MODIFY)
│   ├── SeasonCard.tsx            # Result card (DO NOT MODIFY)
│   ├── QuestionCard.tsx          # Question display with radio options
│   ├── PhotoUpload.tsx           # Drag-drop file upload with preview
│   ├── ColorPalette.tsx          # Color grid with copy-to-clipboard
│   ├── ExportButton.tsx          # PNG export (Stories/Feed formats)
│   ├── ShareableCard.tsx         # Social media card generator
│   ├── ThemeProvider.tsx         # next-themes wrapper
│   ├── ThemeToggle.tsx           # Dark/light mode switch
│   └── ui/                       # shadcn/ui components (button, card, etc.)
├── lib/                          # Core logic
│   ├── color-seasons.ts          # Main database (DO NOT MODIFY)
│   ├── color-seasons.test.ts     # Jest test suite
│   ├── openai.ts                 # GPT-4o Vision integration
│   └── utils.ts                  # cn() helper for Tailwind classes
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (192x192, 512x512)
└── types/next-pwa.d.ts           # PWA TypeScript definitions
```

## Architecture

### User Flows

**Questionnaire Path:**
```
/ → /questionario → calculateSeason(answers) → /resultado?estacao=X&source=questionario
```

**Photo Analysis Path:**
```
/ → /analise-foto → POST /api/analyze → analyzePhoto() → /resultado?estacao=X&source=foto&confidence=Y
```

### Core Files

**lib/color-seasons.ts** - Main database and logic (DO NOT MODIFY):
- `seasons: Record<SubSeason, SeasonData>` - 12 season definitions with palettes, tips, celebrities
- `questions: Question[]` - 10 questions (7 basic + 3 refinement) with point-based scoring
- `calculateSeason(answers)` → SubSeason - Primary calculation function
- `calculateParentSeason(answers)` → ParentSeason - Helper for 4-season detection

**lib/openai.ts** - GPT-4o Vision integration:
- `analyzePhoto(base64Image)` → `{ season, confidence, undertone, contrast, details }`
- `mapToSubSeason(parentSeason, intensity)` - Maps AI output to SubSeason

### Type System

```typescript
type SubSeason = 'primavera-quente' | 'primavera-clara' | 'primavera-brilhante'
               | 'verao-suave' | 'verao-claro' | 'verao-frio'
               | 'outono-suave' | 'outono-quente' | 'outono-profundo'
               | 'inverno-profundo' | 'inverno-frio' | 'inverno-brilhante';

type ParentSeason = 'primavera' | 'verao' | 'outono' | 'inverno';
type Season = SubSeason; // Legacy alias

interface SeasonData {
  id: SubSeason
  parentSeason: ParentSeason
  name: string
  subtitle: string
  description: string
  characteristics: string[]
  celebrities: { brazilian: string[]; international: string[] }
  palette: string[]      // 12 hex colors
  avoidColors: string[]  // 5+ colors to avoid
  tips: { roupas, maquiagem, acessorios, cabelo }
  gradient: string       // Tailwind gradient class
}
```

## Do Not Modify

These files are protected and should not be changed:
- `lib/color-seasons.ts` - Core 965-line season database
- `components/SeasonCard.tsx` - Main result card component
- `components/Header.tsx` - Navigation component

## Key Patterns

**Season Calculation:**
1. Sum points from answers for each of 4 parent seasons
2. Calculate subPoints (light/bright/soft/deep) for intensity
3. Map parent + dominant intensity → specific SubSeason

**State Management:**
- URL query params for cross-page state (stateless, shareable)
- No global state library - React hooks only

**OpenAI Integration:**
- Lazy client initialization (avoids build-time errors without API key)
- Structured JSON prompts with regex extraction and fallback

**Component Patterns:**
- `'use client'` directive on interactive components
- Radix UI primitives for accessibility
- Suspense fallbacks on dynamic pages
- Ref forwarding for export functionality

## API Routes

### POST `/api/analyze`

Analyzes a photo using GPT-4o Vision to determine color season.

**Request:**
```json
{ "image": "data:image/jpeg;base64,..." }
```

**Response:**
```json
{
  "season": "primavera-quente",
  "confidence": 85,
  "undertone": "quente",
  "contrast": "medio",
  "details": "Voce tem caracteristicas..."
}
```

## Stack

- Next.js 16 with App Router and Turbopack
- React 19, TypeScript 5
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- shadcn/ui components (Radix UI primitives)
- next-themes for dark mode (class strategy)
- next-pwa for PWA support
- Jest 30 + ts-jest for testing
- html-to-image for PNG export
- lucide-react for icons

## Environment Variables

Required in `.env.local` for photo analysis:
```
OPENAI_API_KEY=sk-...
```

The API key is checked at runtime in `/api/analyze`. The app works without it (questionnaire path only).

## Testing

Tests in `lib/color-seasons.test.ts` verify:
- Structure: 12 sub-seasons, 3 per parent, all required fields
- Palettes: exactly 12 valid hex colors per season
- Calculations: parent season and sub-season determination
- Content: Portuguese text validation
- Celebrities: 2+ Brazilian, 2+ International per season
- Tips: roupas, maquiagem, acessorios, cabelo fields present

Run tests before committing changes:
```bash
npm test
```

## PWA Configuration

The app is configured as a Progressive Web App:
- **manifest.json**: App name, icons, theme color (#a855f7)
- **next-pwa**: Service worker registration (production only)
- **Display**: Standalone mode for native app experience

## Styling Conventions

- **Tailwind CSS 4** with OkLch color space
- **CSS variables** in globals.css for theming
- **Dark mode** via next-themes (class strategy)
- **Animations**: fade-in, scale-in, float (custom keyframes)
- **Gradients**: from-rose via-purple to-amber brand colors
- **Mobile-first** responsive design (md: breakpoints)

## Best Practices for Development

1. **Always run tests** after modifying calculation logic
2. **Use TypeScript strictly** - no `any` types
3. **Maintain Portuguese** for all user-facing text
4. **Keep state in URL** for shareable results
5. **Use shadcn/ui** for new UI components
6. **Follow existing patterns** for new pages/components
