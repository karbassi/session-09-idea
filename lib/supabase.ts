import { createClient } from '@supabase/supabase-js';

// Use placeholder values for build-time, but warn in development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Warn if using placeholder values in browser
if (typeof window !== 'undefined' && supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('⚠️ Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  image_url?: string;
  active: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  hair_info?: string;
  notes?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  deposit_receipt_url?: string;
  created_at: string;
  client?: Client;
  service?: Service;
}
