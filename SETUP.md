# Hairstylist Booking Platform - Setup Guide

This is a Phase 1 MVP implementation of a hairstylist booking platform built with Next.js, Tailwind CSS, Shadcn/ui, and Supabase.

## Features Implemented (Phase 1)

- ✅ Next.js 14+ with App Router and TypeScript
- ✅ Tailwind CSS v4 for styling
- ✅ Shadcn/ui components (Button, Input, Card, Label, Textarea)
- ✅ Supabase backend integration
- ✅ Admin authentication system
- ✅ Admin dashboard with today's appointments overview
- ✅ Services management page (CRUD operations)
- ✅ Public services display page
- ✅ Booking form with client information fields
- ✅ Calendar/time slot selection with availability checking
- ✅ Database schema for all required tables

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to Project Settings > API to find your project URL and anon key
3. In the SQL Editor, run the schema from `supabase/schema.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create an Admin User

In your Supabase project:

1. Go to Authentication > Users
2. Click "Add user" and create an admin account with email and password
3. This account will be used to log in to the admin panel

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

### Public Pages

- `/` - Landing page with service overview
- `/services` - Public services display page
- `/book` - Booking form with calendar and client information

### Admin Pages (requires authentication)

- `/login` - Admin login page
- `/admin` - Admin dashboard showing today's appointments and stats
- `/admin/services` - Service management (view/add/edit/delete services)
- `/admin/services/new` - Add new service

## Database Tables

The following tables are created by the schema:

1. **services** - Service offerings (name, description, duration, price, etc.)
2. **clients** - Client information (name, email, phone, address, etc.)
3. **bookings** - Appointment bookings with status tracking
4. **blocked_times** - Blocked time slots in the calendar
5. **admin_settings** - Global settings (business hours, notifications, etc.)

## Key Features

### Admin Dashboard
- View today's appointments
- See pending bookings count
- Track active services

### Service Management
- Add, edit, and delete services
- Toggle service active/inactive status
- Set service duration and pricing

### Public Booking
- Browse available services
- Select date and time from available slots
- Fill in client information
- Automatic conflict checking with existing bookings

### Calendar Logic
- Business hours: 9 AM - 5 PM (weekdays only)
- Automatically blocks booked time slots
- Respects blocked_times table
- 30-minute time slot intervals

## Build for Production

```bash
npm run build
npm start
```

## Deployment

This application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

## Next Steps (Future Phases)

- Phase 2: Deposit system with Zelle integration
- Phase 3: Email/SMS notifications
- Phase 4: Messaging system
- Phase 5: Advanced features and polish

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth)
- **Date Handling:** date-fns
- **Deployment:** Vercel (recommended)
