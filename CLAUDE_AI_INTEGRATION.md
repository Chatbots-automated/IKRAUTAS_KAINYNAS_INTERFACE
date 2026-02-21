# Claude AI Integration - Saulės Elektrinės Module

## Overview
Integrated Claude AI SDK for intelligent solar power plant consultations with real-time variable extraction.

## Features Implemented

### 1. Module Selection Screen (`/`)
- Beautiful selection interface with two main modules:
  - **Saulės Elektrinės** (Solar Plants) - AI-assisted consultations
  - **Įkrovimo Stotelės** (Charging Stations) - Traditional offer management
- Branded with Įkrautas colors (dark blue, cyan, white)
- Quick access links to offers, products, and templates

### 2. Solar Plants Interface (`/solar-plants`)
**Layout:**
- **Left Panel**: Claude AI chat interface
  - Real-time conversation with Claude
  - Natural language processing
  - Lithuanian language support
  - Auto-scroll to latest message
  
- **Right Panel**: Auto-filled variables
  - Client information (name, address, phone, email)
  - Technical data (roof type, roof area, consumption, desired power)
  - Project info (budget, installation date, notes)
  - Real-time updates as Claude extracts information
  - "Kurti pasiūlymą" button (ready for future integration)

### 3. Claude API Integration (`/api/claude/solar-consultation`)
**Features:**
- Secure server-side API key storage
- Claude 3.5 Sonnet model
- Smart system prompt for:
  - Solar power expertise
  - Lithuanian language
  - Variable extraction from conversation
  - Natural, non-form-like questioning
  - Technical explanations
- JSON-based variable extraction
- Context-aware responses (remembers collected data)

### 4. Security
- API key stored in `.env.local` (server-side only)
- Never exposed to client
- Secure API route handling

## Technical Stack
- **Claude SDK**: `@anthropic-ai/sdk`
- **Model**: `claude-3-5-sonnet-20241022`
- **Language**: TypeScript
- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS with Įkrautas branding

## User Flow
1. User visits home page → sees module selection
2. Clicks "Saulės Elektrinės" → enters chat interface
3. Chats naturally with Claude AI in Lithuanian
4. Claude extracts variables automatically (shown on right)
5. When complete, user can create offer with collected data

## Variables Being Extracted
```typescript
interface SolarVariables {
  clientName?: string;          // Kliento vardas, pavardė
  clientAddress?: string;        // Kliento adresas
  clientPhone?: string;          // Telefono numeris
  clientEmail?: string;          // El. paštas
  roofType?: string;            // Stogo tipas (šlaitinis/plokščias)
  roofArea?: string;            // Stogo plotas m²
  monthlyConsumption?: string;  // Mėnesinis suvartojimas kWh
  desiredPower?: string;        // Norima galia kW
  budget?: string;              // Biudžetas EUR
  installationDate?: string;    // Montavimo data
  notes?: string;               // Pastabos
}
```

## Next Steps (Future Enhancements)
- Connect "Kurti pasiūlymą" button to offer creation system
- Store consultation sessions in Supabase
- Add product recommendations based on extracted variables
- Auto-calculate optimal solar plant configuration
- Generate instant quotes during conversation
- Add file upload for roof photos/blueprints
- Multi-language support

## Testing
1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Saulės Elektrinės"
4. Chat with Claude AI in Lithuanian
5. Watch variables populate on the right panel

## Environment Variables Required
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Files Created/Modified
- `app/page.tsx` - Module selection screen
- `app/solar-plants/page.tsx` - Solar consultation interface
- `app/charging-stations/page.tsx` - Moved dashboard here
- `app/api/claude/solar-consultation/route.ts` - Claude API endpoint
- `.env.local` - Added ANTHROPIC_API_KEY

---

**Status**: ✅ Complete and ready to test
**Date**: 2026-02-20
