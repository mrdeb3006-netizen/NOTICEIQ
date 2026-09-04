# NOTICEIQ

> **From Information to Action.**  
> AI-powered action management platform for students, schools, and colleges.

---

## 💡 Overview

Students receive dozens of notices, circulars, announcements, and deadlines every week across disparate portals and channels. **NoticeIQ** transforms raw institutional communication into clear, personalized, and prioritized daily action steps.

### The Core Workflow
```
NOTICE → UNDERSTAND → PERSONALIZE → PRIORITIZE → ACT
```

1. **NOTICE**: Central ingestion of school and college announcements and circulars.
2. **UNDERSTAND**: AI analysis extracting core deliverables, eligibility rules, and hard submission dates.
3. **PERSONALIZE**: Smart matching to isolate only notices relevant to a student's branch, year, and courses.
4. **PRIORITIZE**: Intelligent sequencing based on impending deadlines and active workload.
5. **ACT**: Executable task schedules and daily priority feeds for frictionless achievement.

---

## 🚀 Step 1 Features

- **Landing Page (`/`)**:
  - Hero section with clear value proposition and interactive notice-to-action demo preview.
  - 5-step visual workflow pipeline.
  - Three core feature cards: *AI Notice Understanding*, *Personalized Priorities*, and *Adaptive Action Plan*.
- **Role Selection Portal (`/get-started`)**:
  - 🎓 **Student Portal**: Manage notices, tasks, and personalized priorities.
  - 🏫 **Institution Portal**: Campus-wide notice dispatch and student reach analytics.
  - 👨‍🏫 **Faculty Portal**: Course announcements and assignment deadline broadcaster.
- **Role-Specific Authentication Screens**:
  - **Student Login (`/auth/student`)**: Dual authentication supporting College Students (Official College Email SSO) and School Students (Unique Student ID).
  - **Institution Login (`/auth/institution`)**: Administrative credentials login with link to Institution Registration.
  - **Institution Registration (`/auth/institution/register`)**: Onboarding form for schools and universities.
  - **Faculty Login (`/auth/faculty`)**: Faculty email login for departmental broadcasts.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Target Backend Integrations (Future Steps)**: Supabase (Auth/Database) & OpenAI API

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mrdeb3006-netizen/NOTICEIQ.git

# Navigate into the project folder
cd NOTICEIQ

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view NoticeIQ.

---

## 📂 Project Architecture

```
NOTICEIQ/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Global Root Layout & Metadata
│   │   ├── page.tsx                       # Landing Page
│   │   ├── get-started/
│   │   │   └── page.tsx                   # Role Selection Gateway
│   │   └── auth/
│   │       ├── student/
│   │       │   └── page.tsx               # Student Login (College & School modes)
│   │       ├── institution/
│   │       │   ├── page.tsx               # Institution Login
│   │       │   └── register/
│   │       │       └── page.tsx           # Institution Registration
│   │       └── faculty/
│   │           └── page.tsx               # Faculty Login
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                 # Responsive Header with Mobile Drawer
│   │   │   └── Footer.tsx                 # Clean Modern Footer
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx            # Headline, Subheading, CTAs, Preview Card
│   │   │   ├── WorkflowSection.tsx        # 5-Step Visual Pipeline
│   │   │   └── FeatureGrid.tsx            # 3 Core Feature Cards
│   │   ├── role/
│   │   │   └── RoleCard.tsx               # Interactive Role Selection Cards
│   │   └── ui/
│   │       ├── Button.tsx                 # Reusable Button Component
│   │       ├── Input.tsx                  # Form Input with Validation & Icons
│   │       └── AuthCard.tsx               # Elevated Card Wrapper for Auth Pages
│   └── types/
│       └── index.ts                       # TypeScript Interfaces
├── public/                                # Static Assets
└── package.json
```

---

## 📄 License
MIT © NoticeIQ
