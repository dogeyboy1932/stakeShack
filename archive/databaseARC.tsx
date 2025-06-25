// Apartment Database Operations
// export async function getApartments(userId?: string): Promise<Apartment[]> {
//   const { data, error } = await supabase
//     .from('apartments')
//     .select('*')
//     .order('created_at', { ascending: false })

//   if (error) {
//     console.error('Error fetching apartments:', error)
//     return []
//   }

//   let apartments = data.map(transformApartmentFromDB)
  
//   // Filter out user's own apartments and apartments they're already interested in
//   if (userId) {
//     const userProfile = await getProfileById(userId)
//     if (userProfile) {
//       const ownedApartments = new Set(userProfile.apartments_for_sale)
//       const interestedApartments = new Set(userProfile.apartments_interested.keys())
      
//       apartments = apartments.filter(apartment => 
//         !ownedApartments.has(apartment.id) && 
//         !interestedApartments.has(apartment.id)
//       )
//     }
//   }
  
//   return apartments
// }