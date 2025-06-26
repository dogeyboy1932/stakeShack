# Supabase Setup Instructions

This application uses Supabase as the backend database for storing apartment listings and user profiles. Follow these steps to set up your Supabase project:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "rent-stake-app")
5. Enter a secure database password
6. Choose a region closest to your users
7. Click "Create new project"

## 2. Set Up Environment Variables

Create a `.env.local` file in the `first` directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard:
- Go to Settings → API
- Copy the "Project URL" and "anon public" key

## 3. Set Up Database Tables

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the contents of `database-setup.sql` into the editor
3. Click "Run" to execute the SQL commands

This will create:
- `apartments` table for storing apartment listings
- `profiles` table for storing user profiles
- Proper indexes for performance
- Row Level Security (RLS) policies
- Auto-updating timestamps

## 4. Test the Connection

1. Start your development server: `pnpm dev`
2. Navigate to `http://localhost:3000`
3. The app will automatically seed the database with sample data on first load
4. Connect your wallet and try creating/editing a profile

## 5. Database Schema

### Apartments Table
- `id` (UUID): Primary key
- `image` (TEXT): Image URL for the apartment
- `bedrooms` (INTEGER): Number of bedrooms
- `bathrooms` (DECIMAL): Number of bathrooms
- `sqft` (INTEGER): Square footage
- `rent` (INTEGER): Monthly rent in dollars
- `location` (TEXT): Apartment location
- `stake` (INTEGER): Required stake amount
- `interested` (INTEGER): Number of interested parties
- `status` (TEXT): 'Available', 'Staked', 'Confirmed', or 'Pending'
- `amenities` (TEXT[]): Array of amenity strings
- `created_at` / `updated_at`: Timestamps

### Profiles Table
- `id` (UUID): Primary key
- `name` (TEXT): User's display name
- `bio` (TEXT): User's biography
- `pubkey` (TEXT): Solana wallet public key (unique)
- `reputation_score` (DECIMAL): User's reputation score
- `email` (TEXT): User's email address
- `apartments_interested` (TEXT[]): Array of apartment IDs
- `apartments_for_sale` (TEXT[]): Array of apartment IDs user is selling
- `created_at` / `updated_at`: Timestamps

## 6. Security

The database uses Row Level Security (RLS) with the following policies:
- All users can read apartment listings and profiles
- Users can create their own profiles and apartment listings
- Users can update/delete their own data
- All operations are logged with timestamps

## 7. Development Tips

- Use the Supabase dashboard to view and edit data during development
- Check the "Logs" section for debugging database queries
- Use the "API" section to test queries directly
- Enable realtime subscriptions if you want live updates

## Troubleshooting

1. **Connection errors**: Check your environment variables are correct
2. **Permission errors**: Verify RLS policies are set up correctly
3. **Data not showing**: Check the browser console for JavaScript errors
4. **Seed data issues**: Clear the apartments table and restart the app to re-seed

For more help, check the [Supabase documentation](https://supabase.com/docs) or the application logs in your browser's developer tools. 