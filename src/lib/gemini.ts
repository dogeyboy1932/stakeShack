import { GoogleGenerativeAI } from '@google/generative-ai';
import { Profile, Apartment } from './schema';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Get the model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });



export async function generateProfileSummary(profile: Profile): Promise<string> {
  const prompt = `
You are an AI assistant for a rental platform that evaluates user profiles to help landlords and tenants make better decisions.

Please assess the following profile using a rubric format. Assign each category a rating from 1 to 5 stars ⭐ and provide specific insights per category.

**Profile Data:**
- Name: ${profile.name}
- Username: @${profile.username}
- Bio: ${profile.bio || 'No bio provided'}
- Email: ${profile.email}
- Phone: ${profile.phone || 'Not provided'}
- Reputation Score: ${profile.reputationScore}/5
- Apartments Interested: ${profile.apartments_interested?.size || 0}
- Listings for Sale: ${profile.apartments_for_sale?.length || 0}
- Referral Limit: ${profile.referral_limit}
- Referral Statuses: ${profile.referral_statuses ? Object.keys(profile.referral_statuses).length : 0} active referrals

**Evaluation Rubric:**
Rate and explain each of the following areas:
- ⭐ Trustworthiness (based on reputation score and referrals)
- 👤 Profile Completeness (bio, contact info, overall detail)
- 🌍 Location Relevance (proximity to listings or common areas)
- 🧾 Activity & Engagement (interest in listings, referrals, postings)
- 🏡 Tenant or Landlord Potential (based on intent and history)
- 🚩 Notable Positives / Red Flags

**Requirements:**
1. Start with "🤖 **AI Profile Analysis**"
2. Include star ratings per category
3. Provide a final recommendation (e.g. “Recommended tenant with high trust”, “Caution advised”, etc.)
4. Be professional but friendly
5. Use bullet points and clear headings for readability
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating profile summary:', error);
    throw new Error('Failed to generate profile summary');
  }
}




export async function generateApartmentSummary(apartment: Apartment): Promise<string> {
  const pricePerSqft = apartment.rent / apartment.sqft;

  const prompt = `
You are an AI assistant for a rental platform that evaluates apartment listings to help tenants make informed choices.

Please assess the following apartment using a rubric format. Assign each category a rating from 1 to 5 stars ⭐ and provide specific insights per category.

**Property Data:**
- Location: ${apartment.location}
- Rent: $${apartment.rent.toLocaleString()}/month
- Bedrooms: ${apartment.bedrooms}
- Bathrooms: ${apartment.bathrooms}
- Square Feet: ${apartment.sqft}
- Price per sqft: $${pricePerSqft.toFixed(2)}
- Required Stake: $${apartment.stake.toLocaleString()}
- Referral Reward: $${apartment.reward.toLocaleString()}
- Current Interest: ${apartment.interested} people
- Amenities: ${apartment.amenities.join(', ')}
- Description: ${apartment.description || 'No description provided'}
- Available From: ${apartment.available_from || 'Not specified'}
- Available Until: ${apartment.available_until || 'Not specified'}
- Referral Limit: ${apartment.referral_limit}

**Evaluation Rubric:**
Rate and explain each of the following areas:
- 💰 Value for Money (based on price/sqft and size)
- 🔐 Security Requirements (stake amount & stake-to-rent ratio)
- 🌟 Market Appeal (interest level, amenities, condition)
- 🔄 Flexibility & Availability (dates, lease options)
- 🎁 Referral Incentive (amount vs. limit)
- 🧠 Landlord Strategy (insights from reward/stake structure)
- 🚩 Key Selling Points / Potential Concerns

**Key Notes:**
- Tenant is paying with sol (Solana cryptocurrency)
- Location matters extremely in gauging whether the price is fair

**Requirements:**
1. Start with "🤖 **AI Property Analysis**"
2. Include star ratings per category
3. Provide a final recommendation for tenants (e.g. “Excellent opportunity”, “Good but with tradeoffs”, etc.)
4. Be professional but friendly
5. Use bullet points and clear sections for readability
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating apartment summary:', error);
    throw new Error('Failed to generate apartment summary');
  }
}
