# Hairstylist Booking Platform

A professional booking platform for independent mobile hairstylists, featuring Zelle payment integration and admin approval workflow.

## Features

### Client Features
- **Easy Booking Flow**: Multi-step booking process with intuitive interface
- **Zelle Payment**: Simple deposit payment via Zelle with QR code
- **Receipt Upload**: Drag-and-drop receipt screenshot upload
- **Booking Confirmation**: Email confirmation and booking tracking

### Admin Features
- **Dashboard**: Overview of pending, confirmed, and total bookings
- **Pending Approvals**: Review and approve bookings with receipt verification
- **Booking Management**: View all bookings with filtering by status
- **Receipt Verification**: View uploaded payment receipts before approval

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL database + Storage)
- **File Upload**: react-dropzone
- **Icons**: lucide-react
- **QR Codes**: qrcode.react

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/karbassi/session-09-idea.git
cd session-09-idea
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a `.env.local` file with your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
session-09-idea/
├── app/
│   ├── admin/               # Admin dashboard pages
│   │   ├── all-bookings/   # All bookings management
│   │   └── page.tsx        # Main dashboard
│   ├── booking/            # Client booking flow
│   │   └── page.tsx        # Multi-step booking page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── BookingForm.tsx     # Client booking form
│   ├── PendingBookings.tsx # Admin pending approvals
│   ├── ReceiptUpload.tsx   # Receipt upload component
│   └── ZelleInstructions.tsx # Zelle payment instructions
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── utils.ts            # Utility functions
├── ARCHITECTURE.md         # Original project architecture
├── DATABASE_SCHEMA.md      # Database schema documentation
└── SUPABASE_SETUP.md       # Supabase setup guide
```

## User Flows

### Client Booking Flow

1. **Booking Details**: Fill out booking form with personal information
2. **Payment Instructions**: View Zelle payment details and QR code
3. **Upload Receipt**: Upload payment confirmation screenshot
4. **Confirmation**: Receive booking reference and wait for approval

### Admin Approval Flow

1. **Dashboard**: View statistics and pending bookings
2. **Review Booking**: Check client details and view receipt
3. **Approve/Reject**: Approve or reject the booking
4. **Status Update**: Booking status is updated automatically

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete database schema including:
- Services table
- Clients table
- Bookings table (with `deposit_receipt_url` field)
- Admin settings table
- Storage buckets for receipts

## Phase 2 Implementation

This project implements Phase 2 of the booking platform:

✅ Display Zelle payment instructions with QR code  
✅ Implement receipt/screenshot upload functionality using react-dropzone  
✅ Configure Supabase Storage for receipt images  
✅ Create admin approval workflow interface  
✅ Add booking status management (pending/confirmed/rejected)  
✅ Build receipt verification page for admin  
✅ Update bookings table with deposit_receipt_url field  
✅ Create "Pending Bookings" section in admin dashboard  
✅ Implement booking approval/rejection actions  
✅ Add deposit received marking functionality  

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Security Notes

- Never commit `.env.local` to version control
- Set up Row Level Security (RLS) policies in Supabase
- Consider adding authentication for admin dashboard in production
- Review and test all security policies before going live

## Future Enhancements

- Email notifications for booking confirmations
- SMS reminders
- In-app messaging between client and stylist
- Calendar view for admin
- Service management interface
- Client portal to view booking history

## Contributing

This is a class project. For contributions, please fork the repository and submit a pull request.

## License

ISC

## Author

Created as part of Session 09 coursework.
