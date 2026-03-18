# PodCraft

**AI-Powered Podcast Creation Platform**

PodCraft transforms any content into professional podcast episodes. Upload PDFs, paste URLs, or type text and let AI generate engaging audio discussions with customizable host personalities, discussion formats, and chapter markers. Publish series with auto-generated RSS feeds.

## Features

- **Document to Podcast** -- Convert PDFs, URLs, and text into audio discussions
- **AI Host Personalities** -- Distinct AI hosts with unique voices, styles, and expertise
- **Discussion Formats** -- Interview, debate, explainer, or Q&A formats
- **Chapter Markers & Transcripts** -- Auto-generated chapters and synchronized transcripts
- **RSS Feed Generator** -- Publish series with feeds compatible with all major podcast platforms
- **Listener Analytics** -- Track plays, downloads, retention, and engagement metrics
- **Episode Management** -- Organize episodes into series with metadata and artwork
- **Audio Processing** -- ID3 tag writing and audio file management

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI:** OpenAI API
- **Audio:** ID3 tag writing
- **Cloud Storage:** AWS S3
- **Backend:** Supabase (Auth, Database, SSR)
- **RSS:** rss library for feed generation
- **PDF Parsing:** pdf-parse
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Validation:** Zod
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- AWS S3 bucket

### Installation

```bash
git clone <repository-url>
cd podcraft
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   └── (dashboard)/
│       ├── page.tsx          # Dashboard home
│       ├── episodes/         # Episode management
│       ├── series/           # Series organization
│       ├── analytics/        # Listener analytics
│       └── settings/         # Account settings
├── components/               # Radix UI-based components
└── lib/                      # Supabase, S3, OpenAI clients
```

