-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  hair_info TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  deposit_receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blocked_times table
CREATE TABLE IF NOT EXISTS blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zelle_info TEXT,
  business_hours JSONB,
  notification_email TEXT,
  notification_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_blocked_times_date ON blocked_times(date);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (active = true);

-- Create policies for admin full access (authenticated users)
CREATE POLICY "Admin can do everything with services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can do everything with clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can do everything with bookings" ON bookings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can do everything with blocked_times" ON blocked_times
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can do everything with admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for public booking creation
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (active = true);

-- Create policies for public client creation
CREATE POLICY "Anyone can create clients" ON clients
  FOR INSERT WITH CHECK (true);

-- Create policies for public viewing of blocked times
CREATE POLICY "Anyone can view blocked times" ON blocked_times
  FOR SELECT USING (true);
