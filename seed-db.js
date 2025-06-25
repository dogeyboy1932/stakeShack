// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are provided
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file!');
  console.log('');
  console.log('📋 Make sure your .env file contains:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabaseSchema() {
  console.log('🔄 Updating database schema...');
  
  try {
    // Test connection first
    const { data, error } = await supabase.from('apartments').select('id').limit(1);
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message);
      console.log('💡 Make sure your credentials are correct and you have the right permissions');
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Since we can't run raw SQL through the client easily, let's just proceed to seeding
    // The schema should be updated manually in Supabase dashboard using the SQL from database-setup.sql
    console.log('ℹ️  For schema updates, please run the SQL from database-setup.sql in your Supabase SQL editor');
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Check if data already exists
    const { data: existingApartments } = await supabase
      .from('apartments')
      .select('id')
      .limit(1);

    if (existingApartments && existingApartments.length > 0) {
      console.log('📊 Database already has data, clearing first...');
      
      // Clear existing data
      await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('apartments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🗑️  Existing data cleared');
    }

    // Seed 4 profiles first to get their IDs
    console.log('👥 Creating 4 profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          username: "yourname",
          name: "Your Name",
          bio: "Real estate enthusiast and apartment owner. Looking to connect with great tenants.",
          pubkey: "EaT2NY6dYrsHdR4ETSJWGYY12JuQDReSaQ2QrCzuzaNf",
          reputation_score: 4.8,
          email: "your.email@example.com",
          apartments_interested: {}, // Empty to start
          apartments_for_sale: [], // Will be updated after apartments are created
          phone: "+1-555-0123",
          referral_limit: 3,
          referral_statuses: [],
        },
        {
          username: "alice_smith",
          name: "Alice Smith",
          bio: "Software engineer at a tech startup. Love modern amenities and city life.",
          pubkey: "5J8VVQwN2S9M3vKTpBKD4zR3FqHxGjQvLpU8rXzP7eWc",
          reputation_score: 4.9,
          email: "alice.smith@techcorp.com",
          apartments_interested: {},
          apartments_for_sale: [],
          phone: "+1-555-0124",
          referral_limit: 2,
          referral_statuses: [],
        },
        {
          username: "bob_johnson",
          name: "Bob Johnson",
          bio: "Digital nomad and crypto trader. Need a flexible lease with good internet.",
          pubkey: "9X3KqJpR5mY7hL2eN8sW6vT4bC1dFgHjUoP0zAiExcQw",
          reputation_score: 4.2,
          email: "bob.johnson@gmail.com",
          apartments_interested: {},
          apartments_for_sale: [],
          phone: "+1-555-0125",
          referral_limit: 1,
          referral_statuses: [],
        },
        {
          username: "carol_williams",
          name: "Carol Williams",
          bio: "Medical resident looking for a quiet place to study. Clean and organized.",
          pubkey: "2D7BfVnQ4kM9xS6tL8uY3wR1hC5eGpKjNzAo0iFxTqPv",
          reputation_score: 4.7,
          email: "carol.williams@hospital.org",
          apartments_interested: {},
          apartments_for_sale: [],
          phone: "+1-555-0126",
          referral_limit: 4,
          referral_statuses: [],
        },
      ])
      .select();

    if (profileError) {
      throw profileError;
    }

    console.log(`✅ Created ${profileData.length} profiles`);

    // Get profile IDs for apartment ownership
    const profileIds = profileData?.map(profile => profile.id) || [];

    // Seed 6 apartments with proper owner distribution (each profile owns 1-2 apartments)
    console.log('🏠 Creating 6 apartments...');
    const { data: apartmentData, error: apartmentError } = await supabase
      .from('apartments')
      .insert([
        {
          owner: profileIds[0], // yourname owns apartment 1
          image: "/apartments/apartment-1.gif",
          bedrooms: 2,
          bathrooms: 2,
          sqft: 1100,
          location: "Sunnyvale, CA",
          rent: 3200,
          stake: 1600,
          reward: 800,
          interested: 0,
          amenities: ["In-unit laundry", "Pool", "Gym"],
          description: "Beautiful 2-bedroom apartment with modern amenities and great location.",
          available_from: "2024-02-01",
          available_until: "2025-01-31",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 5,
          referral_statuses: [],
        },
        {
          owner: profileIds[0], // yourname owns apartment 2
          image: "/apartments/apartment-2.gif",
          bedrooms: 1,
          bathrooms: 1,
          sqft: 750,
          location: "San Francisco, CA",
          rent: 4500,
          stake: 2250,
          reward: 1125,
          interested: 0,
          amenities: ["Rooftop deck", "Doorman"],
          description: "Luxury studio in the heart of San Francisco with stunning city views.",
          available_from: "2024-03-01",
          available_until: "2024-12-31",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 3,
          referral_statuses: [],
        },
        {
          owner: profileIds[1], // alice_smith owns apartment 3
          image: "/apartments/apartment-3.gif",
          bedrooms: 3,
          bathrooms: 2.5,
          sqft: 1600,
          location: "Oakland, CA",
          rent: 3800,
          stake: 1900,
          reward: 950,
          interested: 0,
          amenities: ["Backyard", "Garage parking"],
          description: "Spacious family home with private backyard and garage parking.",
          available_from: "2024-01-15",
          available_until: "2024-12-15",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 4,
          referral_statuses: [],
        },
        {
          owner: profileIds[1], // alice_smith owns apartment 4
          image: "/apartments/apartment-4.gif",
          bedrooms: 0,
          bathrooms: 1,
          sqft: 500,
          location: "Berkeley, CA",
          rent: 2400,
          stake: 1200,
          reward: 600,
          interested: 0,
          amenities: ["Bike storage", "Pet friendly"],
          description: "Cozy studio apartment perfect for students, pet-friendly with bike storage.",
          available_from: "2024-02-15",
          available_until: "2024-08-15",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 2,
          referral_statuses: [],
        },
        {
          owner: profileIds[2], // bob_johnson owns apartment 5
          image: "/apartments/1ba4f49b24b35205ded8ead52b31ff75.webp",
          bedrooms: 2,
          bathrooms: 1.5,
          sqft: 950,
          location: "Palo Alto, CA",
          rent: 3500,
          stake: 1750,
          reward: 875,
          interested: 0,
          amenities: ["Modern kitchen", "Parking"],
          description: "Contemporary 2-bedroom apartment with modern finishes in tech hub.",
          available_from: "2024-04-01",
          available_until: "2025-03-31",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 3,
          referral_statuses: [],
        },
        {
          owner: profileIds[3], // carol_williams owns apartment 6
          image: "/apartments/apartment-1.gif",
          bedrooms: 1,
          bathrooms: 1,
          sqft: 600,
          location: "Mountain View, CA",
          rent: 2800,
          stake: 1400,
          reward: 700,
          interested: 0,
          amenities: ["Quiet neighborhood", "Study area"],
          description: "Perfect for students and professionals, quiet area with dedicated study space.",
          available_from: "2024-05-01",
          available_until: "2024-11-30",
          interested_profiles: [], // No initial interest
          ignored_profiles: [],
          approved_profile: null,
          referral_limit: 2,
          referral_statuses: [],
        },
      ])
      .select();

    if (apartmentError) {
      throw apartmentError;
    }

    console.log(`✅ Created ${apartmentData.length} apartments`);

    // Get apartment IDs for updating profile relationships
    const apartmentIds = apartmentData?.map(apt => apt.id) || [];

    // Update profiles with apartment ownership (no interested apartments to start)
    console.log('🔄 Updating profile relationships...');
    
    // Update yourname profile - owns apartments 1 and 2
    await supabase
      .from('profiles')
      .update({
        apartments_for_sale: [apartmentIds[0], apartmentIds[1]],
        apartments_interested: {}, // Empty to start
        referral_statuses: []
      })
      .eq('id', profileIds[0]);

    // Update alice_smith profile - owns apartments 3 and 4
    await supabase
      .from('profiles')
      .update({
        apartments_for_sale: [apartmentIds[2], apartmentIds[3]],
        apartments_interested: {}, // Empty to start
        referral_statuses: []
      })
      .eq('id', profileIds[1]);

    // Update bob_johnson profile - owns apartment 5
    await supabase
      .from('profiles')
      .update({
        apartments_for_sale: [apartmentIds[4]],
        apartments_interested: {}, // Empty to start
        referral_statuses: []
      })
      .eq('id', profileIds[2]);

    // Update carol_williams profile - owns apartment 6
    await supabase
      .from('profiles')
      .update({
        apartments_for_sale: [apartmentIds[5]],
        apartments_interested: {}, // Empty to start
        referral_statuses: []
      })
      .eq('id', profileIds[3]);

    console.log('✅ Updated profile relationships');
    console.log('🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - 4 profiles created`);
    console.log(`   - 6 apartments created`);
    console.log(`   - Profile 1 (yourname): owns 2 apartments`);
    console.log(`   - Profile 2 (alice_smith): owns 2 apartments`);
    console.log(`   - Profile 3 (bob_johnson): owns 1 apartment`);
    console.log(`   - Profile 4 (carol_williams): owns 1 apartment`);
    console.log(`   - All apartments available with no initial interest`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('💡 It looks like the new columns haven\'t been added to your database yet.');
      console.log('   Please run the SQL from database-setup.sql in your Supabase SQL editor first.');
    }
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting database setup...');
  console.log(`📡 Connecting to: ${supabaseUrl}`);
  
  // Test connection and provide schema update instructions
  const connected = await updateDatabaseSchema();
  if (!connected) {
    process.exit(1);
  }
  
  // Seed the database
  await seedDatabase();
  
  console.log('✨ Database setup complete!');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 