# Admissions Planner MVP

A comprehensive AI-powered university admissions planning platform with real-time data integration.

## 🚀 Quick Deploy

**Хотите развернуть проект онлайн?** Смотрите [DEPLOYMENT.md](./DEPLOYMENT.md) для подробных инструкций по развертыванию на Vercel, Netlify или Railway.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file in the root directory:
```
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_KEY=your_serpapi_key_here  # Optional but recommended for real-time data
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- **Personalized Admission Plans**: AI-powered university and program matching
- **Real-time Data**: Integration with SerpAPI for current admission deadlines, requirements, and information
- **Comprehensive Tools**:
  - Student housing finder with real options
  - Country information and cost of living calculator
  - Documentation guide (visas, residence permits, bank accounts, etc.)
  - Essay and resume editor
- **Multi-language Support**: English, Russian, German, and Serbian
- **Email-based Access**: Access your plans anytime without passwords
- **Admin Dashboard**: View all submissions at `/admin`

## Pages

- `/` - Landing page with call-to-action
- `/form` - Main admission plan form
- `/results?id=<submission_id>` - View admission plan results with detailed program information
- `/access` - Access previous plans by email
- `/admin` - Admin dashboard to view all submissions
- `/housing` - Student housing finder
- `/country-info` - Country information and cost of living
- `/documents` - Documentation guide (visas, permits, etc.)
- `/essay-editor` - Essay and resume editor

## Project Structure

```
app/
  ├── page.tsx          # Home page with form
  ├── results/          # Results page
  ├── access/           # Email-based access page
  ├── admin/            # Admin dashboard
  ├── actions.ts        # Server actions
  ├── types.ts          # TypeScript types
  └── globals.css       # Global styles

lib/
  ├── openai.ts         # OpenAI API integration
  └── storage.ts        # File-based data storage

data/                   # Created automatically (gitignored)
  └── submissions.json  # User submissions stored here
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4o-mini
- **Real-time Data**: SerpAPI
- **Storage**: File-based JSON storage (MVP)

## Notes

- Data is stored in `data/submissions.json` (created automatically)
- Uses OpenAI GPT-4o-mini for AI responses
- SerpAPI integration for real-time admission data, program structures, and images
- No database required - simple file-based storage for MVP
- All submissions are accessible via unique ID in URL
- Multi-language support with React Context

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions on Vercel, Netlify, or Railway.