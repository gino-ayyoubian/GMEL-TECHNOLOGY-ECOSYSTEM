# GMEL Technology Ecosystem

[![Production](https://img.shields.io/badge/Production-Live-success)](https://gmel.kkm-intl.org)
[![Vision](https://img.shields.io/badge/Vision-Live-blue)](https://gmel.vision.kkm-intl.org)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)](https://gmel-technology-ecosystem.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.3%25-blue)](#)

## Overview

**GMEL Technology Ecosystem** is an interactive web application designed to present the **GeoMeta Energy Layer (GMEL)** vision—a comprehensive framework for geothermal energy investment, IP strategy, and multi-region comparative analysis. Built with React, TypeScript, and powered by **Google Gemini AI**, this platform delivers real-time, AI-driven insights for investors, energy analysts, and strategic decision-makers.

## Key Features

- **AI-Powered Analysis**: Leverages Gemini 2.5 Pro and Flash models for structured scenario generation, financial projections, and grounded research
- **Multi-Region Benchmarking**: Compare geothermal potential across Kurdistan, Iran Free Zones, Iceland, and other strategic regions
- **Patent Portfolio Visualization**: Interactive infographic showcasing GMEL's IP roadmap, including `GMEL-DrillX`, `GMEL-ClimateCore`, and `GMEL-HeatBank`
- **Financial Data Engine**: Generates CAPEX, ROI, payback period, and NPV projections tailored to region-specific economic conditions
- **Multi-Language Support**: Full i18n with English, Persian (Farsi), and Kurdish (Sorani) using Gemini-powered translation
- **Responsive Dashboard**: Mobile-first design with animations, dark mode support, and professional data visualization

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Recharts, Lucide Icons
- **AI Integration**: Google Gemini API (`@google/genai`)
  - Gemini 2.5 Pro (extended thinking for complex analysis)
  - Gemini 2.5 Flash (fast content generation)
  - Grounding via Google Search and Maps
- **Deployment**: Vercel (Production & Preview)
- **Internationalization**: React i18next with Gemini translation fallback

## Live Deployments

| Environment | URL | Purpose |
|------------|-----|----------|
| **Production** | [gmel.kkm-intl.org](https://gmel.kkm-intl.org) | Primary application with full feature set |
| **Vision** | [gmel.vision.kkm-intl.org](https://gmel.vision.kkm-intl.org) | Presentation and investor-focused view |
| **Vercel** | [gmel-technology-ecosystem.vercel.app](https://gmel-technology-ecosystem.vercel.app) | Development and staging environment |

## Project Structure

```
GMEL-TECHNOLOGY-ECOSYSTEM/
├── components/         # Reusable UI components
├── contexts/          # React contexts (Auth, Language)
├── hooks/             # Custom hooks (useI18n)
├── i18n/              # Translation files (en, fa, ku)
├── services/          # Gemini AI integration
├── utils/             # Helper functions
├── App.tsx            # Main application
├── Dashboard.tsx      # Primary dashboard
├── Benchmark.tsx      # Region comparison
├── Financials.tsx     # Financial projections
├── GeminiChat.tsx     # AI chat interface
└── constants.ts       # GMEL data (patents, milestones)
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Gemini API Key** from [Google AI Studio](https://ai.studio)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gino-ayyoubian/GMEL-TECHNOLOGY-ECOSYSTEM.git
   cd GMEL-TECHNOLOGY-ECOSYSTEM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` and add your API key:
   ```
   API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

## Core Modules

### Dashboard
Interactive overview of GMEL regions with animated cards, milestone timelines, and quick access to financial and technical analyses.

### Benchmark Comparison
AI-generated side-by-side comparison of geothermal potential, CAPEX estimates, grid stability, policy support, and technical requirements for multiple regions.

### Financial Projections
Dynamic financial modeling for a 5MW GMEL pilot project, including:
- Pilot CAPEX
- Annual Revenue
- Payback Period
- Return on Investment (ROI)
- 10-Year Net Present Value (NPV)

### Patent Infographic
Visual representation of GMEL's IP portfolio, categorized by level (Foundation, Optimization, Scale-Up) with progress indicators and application notes.

### Gemini Chat
Conversational AI interface for technical questions, investment scenario planning, and real-time research powered by Gemini's grounded search capabilities.

## Deployment

The app is automatically deployed via **Vercel** on push to `main`. Custom domains are configured through:
- **cPanel DNS** (for `kkm-intl.org` subdomains)
- **Vercel Project Settings** (for production and preview aliases)

For manual deployment:
```bash
vercel --prod
```

## Roadmap

- [ ] Multi-user collaboration with role-based access (Manager, Advisor, Observer)
- [ ] Advanced Gemini workflows (multi-turn reasoning, function calling)
- [ ] Export financial reports as PDF or Excel
- [ ] Integration with real-time energy market data APIs
- [ ] Video generation for presentation slides (Veo 3.1)
- [ ] Mobile app (React Native) for on-the-go analysis

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with descriptive messages
4. Push to your fork and submit a Pull Request

## License

This project is proprietary to **KKM International**. All rights reserved.

## Contact

- **Organization**: [KKM International](https://kkm-intl.org)
- **GitHub**: [@kkm-intl-co-hub](https://github.com/kkm-intl-co-hub)
- **Primary Maintainer**: [@gino-ayyoubian](https://github.com/gino-ayyoubian)

---

**Powered by [Google Gemini AI](https://ai.google.dev/) | Built with ❤️ for clean energy innovation**
