# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuraCor is a Next.js 16 personal color analysis app (coloração pessoal) implementing the **12-season color theory**:
- 4 main seasons (Primavera, Verão, Outono, Inverno) × 3 sub-variations each
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
```

### Do Not Modify

- `lib/color-seasons.ts` - Core 965-line database
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

## Stack

- Next.js 16 with App Router and Turbopack
- React 19, TypeScript 5
- Tailwind CSS 4 (`@tailwindcss/postcss`)
- shadcn/ui components (Radix UI primitives)
- next-themes for dark mode (class strategy)
- next-pwa for PWA support
- Jest 30 + ts-jest for testing

## Environment Variables

Required in `.env.local` for photo analysis:
```
OPENAI_API_KEY=sk-...
```

## Testing

Tests in `lib/color-seasons.test.ts` verify:
- Structure: 12 sub-seasons, 3 per parent, all required fields
- Palettes: exactly 12 valid hex colors per season
- Calculations: parent season and sub-season determination
- Content: Portuguese text validation
