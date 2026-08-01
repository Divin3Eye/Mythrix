# Mythrix

**An AI-native research workspace** — collect sources, chat with your notebooks, and generate reports. Built with Next.js 16, React 19, Supabase, and a liquid-glass design system.

![Mythrix](public/og-image.png)

---

## Features

### 📓 Notebooks
- Create notebooks with a **full-page animated onboarding** (wipe transition from the "New Notebook" button)
- Each notebook has a title, description, and signature color
- Favorite, archive, and organize into collections

### 📄 Sources
- Upload files (PDF, MD, TXT, etc.) or add URLs
- Drag-and-drop upload with progress
- Source list with file type icons, sizes, and relative timestamps

### 💬 Chat with Your Notebook
- **Streaming AI responses** with word-by-word rendering
- Context-aware: all notebook sources are available to the model
- Quick actions: **Create Report**, **Analyze Sources**, **Summarize**, **Search**
- Message actions: copy, regenerate, thumbs up/down
- Markdown rendering with syntax highlighting

### 🎨 Design System
- **Liquid glass** aesthetic: dark radial gradient base, frosted glass cards, subtle glows
- Consistent tokens: spacing, color, typography (Geist), border radius
- Smooth micro-interactions: hover elevations, fade/zoom animations, reduced-motion support
- White pill CTAs as the signature interactive element

### 🔐 Auth & Security
- Supabase Auth (email/password, OAuth ready)
- Row Level Security on all tables
- Server-side session management via middleware

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Runtime | React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (CSS variables), custom design tokens |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth (@supabase/ssr) |
| Icons | lucide-react |
| Font | Geist (variable) |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── notebook/[id]/        # Notebook workspace
│   │   │   ├── chat/             # AI chat interface
│   │   │   ├── sources/          # Source management
│   │   │   └── layout.tsx        # NotebookChrome (sidebar + topnav)
│   │   ├── notebooks/            # Notebook grid dashboard
│   │   ├── settings/             # User settings
│   │   └── layout.tsx            # App shell
│   ├── (auth)/                   # Login / Signup
│   └── globals.css               # Design tokens, keyframes, utilities
├── components/
│   ├── chat/                     # Chat container, messages, input, sidebar
│   ├── notebook/                 # Header, inspector, chrome (shell)
│   ├── notebooks/                # NotebookGrid, NotebookCard
│   ├── onboarding/               # Full-page wipe onboarding wizard
│   ├── sources/                  # SourceList, SourceRow
│   └── ui/                       # Sidebar, TopNav, SearchDialog, Logo
├── lib/
│   ├── actions/                  # Server actions (notebooks, sources, chat, search, etc.)
│   ├── supabase/                 # Server & client Supabase clients
│   ├── format.ts                 # Date/bytes formatting
│   └── utils.ts                  # cn() class merger
└── middleware.ts                 # Auth session refresh
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- Supabase project (local or cloud)

### Installation

```bash
# Clone
git clone https://github.com/Divin3Eye/Mythrix.git
cd Mythrix

# Install dependencies
pnpm install

# Environment variables
cp .env.example .env.local
# Fill in your Supabase credentials

# Run migrations (if using local Supabase)
pnpm supabase db reset

# Start dev server
pnpm dev
```

Open `http://localhost:3000`.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # server-only
```

---

## Design Tokens (Tailwind v4 / CSS Variables)

Defined in `src/app/globals.css`:

```css
:root {
  /* Surfaces */
  --surface: rgba(255, 255, 255, 0.06);
  --surface-hover: rgba(255, 255, 255, 0.09);
  --surface-active: rgba(255, 255, 255, 0.14);

  /* Borders */
  --border-color: rgba(255, 255, 255, 0.12);
  --border-glass: rgba(255, 255, 255, 0.08);

  /* Accent */
  --accent: #7c5cff;
  --accent-glow: rgba(124, 92, 255, 0.4);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.4);

  /* Page background */
  --bg-page: radial-gradient(125% 125% at 50% 10%, #16161e 45%, #6d28d9 140%);
}
```

---

## Key Components

### Notebook Onboarding (`/components/onboarding/`)
Full-page animated wizard triggered from the "New Notebook" button:
- White circular wipe expands from button origin
- 3 steps: Name → Description → Color
- Live preview card updates as you type
- Word-by-word headline reveal, staggered entrance

### Chat Interface (`/components/chat/`)
- **ChatContainer**: orchestrates messages, streaming, sidebar
- **ChatMessages**: virtualized list, streaming render, action buttons
- **ChatInput**: auto-resize textarea, quick-actions dropdown (Sparkles), attachment/voice
- **ChatSidebar**: collapsible Sources / Tools / Context sections

### Notebook Card (`/components/notebooks/notebook-grid.tsx`)
- Liquid glass card, no top color strap
- Subtle radial color wash from top-left
- Tinted icon chip + title
- Three-dot menu: click-to-open, outside-click/Escape to close, fadeInZoom animation

---

## Scripts

```bash
pnpm dev          # Dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
```

---

## Database Schema

Key tables (see `supabase/migrations/`):

- `notebooks` — id, user_id, title, description, color, icon, is_favorite, deleted_at
- `source_files` — id, user_id, notebook_id, name, url, size_bytes
- `collections` / `collection_notebooks` — folder-like grouping
- `profiles` — extended user info (plan, preferences)
- `shares` — view-only share links
- `notifications` — in-app notifications

All tables have RLS policies: `auth.uid() = user_id`.

---

## Deployment

### Vercel (recommended)
1. Import the repo in Vercel
2. Add environment variables
3. Deploy — Next.js 16 auto-detects

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Code Style
- TypeScript strict mode
- ESLint + Prettier (config in repo)
- Conventional commits
- No emojis as structural icons (use lucide-react)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Geist** by Vercel — typography
- **lucide-react** — icon set
- **Supabase** — backend platform
- **Tailwind CSS v4** — styling engine
- **Next.js team** — the framework

---

<div align="center">
  <sub>Built with precision. Designed for researchers.</sub>
</div>