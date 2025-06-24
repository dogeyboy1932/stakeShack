// // Database types for TypeScript - Only Row types needed
// export interface Database {
//   public: {
//     Tables: {
//       apartments: {
//         Row: {
//           id: string
//           owner: string
//           image: string
//           bedrooms: number
//           bathrooms: number
//           sqft: number
//           rent: number
//           location: string
//           stake: number
//           interested: number

//           amenities: string[]
//           description: string | null
//           available_from: string | null
//           available_until: string | null
//           interested_profiles: string[][]
//           ignored_profiles: string[][]
//           referral_limit: number
//           referral_statuses: string[][]
//           created_at: string
//           updated_at: string
//         }
//       }
//       profiles: {
//         Row: {
//           id: string
//           username: string
//           name: string
//           bio: string
//           pubkey: string
//           reputation_score: number
//           email: string
//           apartments_interested: Record<string, string>
//           apartments_for_sale: string[]
//           phone: string | null
//           created_at: string
//           updated_at: string
//           referral_limit: number
//           referral_statuses: string[][]
//         }
//       }
//     }
//   }
// } 