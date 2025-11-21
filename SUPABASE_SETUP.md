# Supabase Setup Guide

This guide will help you set up Supabase for the hairstylist booking platform.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js installed locally

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - Name: hairstylist-booking
   - Database Password: (generate a strong password)
   - Region: (choose closest to your location)
4. Wait for the project to be created (1-2 minutes)

## Step 2: Set Up Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon/Public key

3. Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 3: Create Database Tables

In the Supabase dashboard, go to SQL Editor and run these queries:

### 1. Create services table
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 2. Create clients table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  hair_info TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 3. Create bookings table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
  deposit_receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 4. Create admin_settings table
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zelle_email TEXT,
  zelle_phone TEXT,
  business_hours JSONB,
  notification_email TEXT,
  notification_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### 5. Create indexes
```sql
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

## Step 4: Set Up Storage

1. In Supabase dashboard, go to Storage
2. Create a new bucket called "receipts"
3. Make it a public bucket:
   - Click on the bucket
   - Click "Policies"
   - Add policy for public read access:

```sql
-- Policy for public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');

-- Policy for authenticated upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');
```

## Step 5: Set Up Row Level Security (Optional but Recommended)

For production, enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Public read services"
ON services FOR SELECT
USING (active = true);

CREATE POLICY "Public insert clients"
ON clients FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public insert bookings"
ON bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public read own bookings"
ON bookings FOR SELECT
USING (true);

CREATE POLICY "Public update own bookings"
ON bookings FOR UPDATE
USING (true);
```

## Step 6: Insert Sample Data (Optional)

Add some test services:

```sql
INSERT INTO services (name, description, duration, price, active) VALUES
  ('Haircut & Style', 'Professional haircut and styling', 60, 75.00, true),
  ('Color Treatment', 'Full hair coloring service', 120, 150.00, true),
  ('Blowout', 'Professional blowout and styling', 45, 60.00, true);
```

Add admin settings with Zelle information:

```sql
INSERT INTO admin_settings (zelle_email, zelle_phone) VALUES
  ('stylist@example.com', '555-123-4567');
```

## Step 7: Test the Connection

Run the development server:

```bash
npm run dev
```

Visit http://localhost:3000 and try creating a booking to test the connection.

## Troubleshooting

### Error: "relation does not exist"
- Make sure all tables are created in the correct order
- Check that you're using the correct schema (public)

### Error: "permission denied"
- Review RLS policies
- Check that the anon key has proper permissions

### Storage upload fails
- Verify the receipts bucket exists
- Check storage policies are correctly set up
- Ensure the bucket is public or has appropriate access policies

## Security Notes

- Never commit `.env.local` to version control
- Use environment-specific keys for development vs production
- Set up proper RLS policies before going to production
- Consider setting up authentication for admin dashboard in production
