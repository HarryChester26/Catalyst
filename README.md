# Smart PT - Smart Public Transport System

A comprehensive public transport management system built with Next.js, featuring real-time disruption reporting, trip planning, and AI-powered chat assistance.

## 🚀 Features

- **Real-time Disruption Reporting**: Report and track public transport disruptions
- **Trip Planning**: Plan your journey with Google Maps integration
- **AI Chat Assistant**: Get help with transport-related queries using Google Gemini AI
- **User Authentication**: Secure user management with Supabase
- **Interactive Maps**: Google Maps integration for route visualization
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Google Maps API
- **AI**: Google Gemini AI
- **Icons**: Lucide React, React Icons

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js) or alternative package manager (yarn, pnpm, bun)
- **Google Maps API key** (for maps and geocoding)
- **Google Gemini AI API key** (for chat functionality)
- **Supabase account and project** (for database and authentication)

> ⚠️ **Important**: This project requires installing dependencies before running. The project uses Next.js, React, Supabase, Google Maps, and many other libraries that need to be installed.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd smart-pt
```

### 2. Install Dependencies

**This step is required!** The project has many dependencies that need to be installed:

```bash
npm install
```

This will install all the required packages including:
- Next.js 15 and React 19
- Supabase client
- Google Maps libraries
- Radix UI components
- Tailwind CSS
- TypeScript types
- And many more...

> 💡 **Note**: This may take a few minutes depending on your internet connection.

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory and add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key
# Alternative: GOOGLE_API_KEY=your_google_api_key
```

#### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

> ⚠️ **If you skip the `npm install` step**, you'll get errors like:
> - `Module not found` errors
> - `Cannot resolve dependency` errors  
> - The development server won't start
> - Build will fail

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── disruptions/       # Disruptions management
│   │   ├── trip-planner/      # Trip planning feature
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utility libraries
│   │   ├── google-maps/      # Google Maps integration
│   │   └── ...
│   └── types/                # TypeScript type definitions
└── ...
```

**Happy coding! 🚀**
