-- Create apartments table
CREATE TABLE IF NOT EXISTS apartments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner TEXT NOT NULL,
  image TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL NOT NULL,
  sqft INTEGER NOT NULL,
  rent INTEGER NOT NULL,
  location TEXT NOT NULL,
  stake FLOAT NOT NULL,
  reward FLOAT NOT NULL,
  interested INTEGER DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  available_from DATE,
  available_until DATE,
  interested_profiles TEXT[] DEFAULT '{}',
  ignored_profiles TEXT[] DEFAULT '{}',
  referrers_pubkeys JSONB DEFAULT '{}',
  approved_profile TEXT,
  referral_limit INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT DEFAULT '',
  pubkey TEXT UNIQUE NOT NULL,
  reputation_score DECIMAL DEFAULT 0,
  phone TEXT,
  referral_limit INTEGER DEFAULT 0,
  referral_statuses JSONB DEFAULT '{}',
  apartments_interested JSONB DEFAULT '{}',
  apartments_recommended JSONB DEFAULT '{}',
  apartments_for_sale TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- verification_status TEXT CHECK (verification_status IN ('unverified', 'pending', 'verified')) DEFAULT 'unverified',


-- Enable Row Level Security (RLS)
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for apartments table
-- Anyone can read apartments
CREATE POLICY "Apartments are viewable by everyone" ON apartments
  FOR SELECT USING (true);

-- Users can insert apartments (for creating listings)
CREATE POLICY "Users can create apartments" ON apartments
  FOR INSERT WITH CHECK (true);

-- Users can update their own apartments
CREATE POLICY "Users can update apartments" ON apartments
  FOR UPDATE USING (true);

-- Users can delete their own apartments
CREATE POLICY "Users can delete apartments" ON apartments
  FOR DELETE USING (true);

-- Create policies for profiles table
-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (true);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apartments_created_at ON apartments(created_at);
CREATE INDEX IF NOT EXISTS idx_apartments_available_from ON apartments(available_from);
CREATE INDEX IF NOT EXISTS idx_apartments_available_until ON apartments(available_until);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
-- CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_apartments_interested ON profiles USING gin(apartments_interested);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_apartments_updated_at 
  BEFORE UPDATE ON apartments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 