import { supabase } from './supabase'
import { Apartment, Profile, Booking, ApartmentStatus, ReferralStatus } from './schema'

// Apartment Database Operations
export async function getApartments(excludeApartmentIds?: Iterable<string>): Promise<Apartment[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching apartments:', error)
    return []
  }

  const apartments = data.map(transformApartmentFromDB)
  
  // Filter out apartments that the user is already interested in
  if (excludeApartmentIds) {
    const excludeSet = new Set(excludeApartmentIds)
    return apartments.filter(apartment => !excludeSet.has(apartment.id))
  }
  
  return apartments
}

// Paginated apartment fetching for lazy loading
export async function getApartmentsPaginated(
  page: number = 0, 
  limit: number = 20, 
  excludeApartmentIds?: Iterable<string>
): Promise<{ apartments: Apartment[], hasMore: boolean, total: number }> {
  const offset = page * limit

  // Get total count first
  const { count, error: countError } = await supabase
    .from('apartments')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting apartments:', countError)
    return { apartments: [], hasMore: false, total: 0 }
  }

  // Get paginated data
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching paginated apartments:', error)
    return { apartments: [], hasMore: false, total: count || 0 }
  }

  const apartments = data.map(transformApartmentFromDB)
  
  // Filter out apartments that the user is already interested in
  let filteredApartments = apartments
  if (excludeApartmentIds) {
    const excludeSet = new Set(excludeApartmentIds)
    filteredApartments = apartments.filter(apartment => !excludeSet.has(apartment.id))
  }
  
  const hasMore = offset + limit < (count || 0)
  
  return { 
    apartments: filteredApartments, 
    hasMore, 
    total: count || 0 
  }
}


// Paginated profiles fetching
export async function getProfilesPaginated(
  page: number = 0, 
  limit: number = 20,
  userId: string
): Promise<{ profiles: Profile[], hasMore: boolean, total: number }> {
  const offset = page * limit

  // Get total count first
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error counting profiles:', countError)
    return { profiles: [], hasMore: false, total: 0 }
  }

  // Get paginated data
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
    .not('id', 'eq', userId)

  if (error) {
    console.error('Error fetching paginated profiles:', error)
    return { profiles: [], hasMore: false, total: count || 0 }
  }

  const profiles = data.map(transformProfileFromDB)
  const hasMore = offset + limit < (count || 0)
  
  return { 
    profiles, 
    hasMore, 
    total: count || 0 
  }
} 


export async function getApartmentById(id: string): Promise<Apartment | null> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching apartment:', error)
    return null
  }

  return transformApartmentFromDB(data)
}



export async function createApartment(apartment: Omit<Apartment, 'id'>): Promise<Apartment | null> {
  const { data, error } = await supabase
    .from('apartments')
    .insert({
      owner: apartment.owner,
      image: apartment.image,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      sqft: apartment.sqft,
      rent: apartment.rent,
      location: apartment.location,
      stake: apartment.stake,
      interested: apartment.interested,
      amenities: apartment.amenities,
      description: apartment.description || null,
      available_from: apartment.available_from || null,
      available_until: apartment.available_until || null,
      interested_profiles: (apartment.interested_profiles || []).map(([id, ref]) => 
        [id, ref || null]
      ),
      ignored_profiles: (apartment.ignored_profiles || []).map(([id, ref]) => 
        [id, ref || null]
      ),
      referral_limit: apartment.referral_limit,
      referral_statuses: apartment.referral_statuses.map(([id, status]) => [id, status as string]),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating apartment:', error)
    return null
  }

  return transformApartmentFromDB(data)
}

export async function updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment | null> {
  const updateData: any = {}
  
  console.log('updates', updates)
  
  if (updates.owner !== undefined) updateData.owner = updates.owner
  if (updates.image !== undefined) updateData.image = updates.image
  if (updates.bedrooms !== undefined) updateData.bedrooms = updates.bedrooms
  if (updates.bathrooms !== undefined) updateData.bathrooms = updates.bathrooms
  if (updates.sqft !== undefined) updateData.sqft = updates.sqft
  if (updates.rent !== undefined) updateData.rent = updates.rent
  if (updates.location !== undefined) updateData.location = updates.location
  if (updates.stake !== undefined) updateData.stake = updates.stake
  if (updates.interested !== undefined) updateData.interested = updates.interested
  if (updates.amenities !== undefined) updateData.amenities = updates.amenities
  if (updates.description !== undefined) updateData.description = updates.description || null
  if (updates.available_from !== undefined) updateData.available_from = updates.available_from || null
  if (updates.available_until !== undefined) updateData.available_until = updates.available_until || null
  if (updates.referral_limit !== undefined) updateData.referral_limit = updates.referral_limit
  if (updates.referral_statuses !== undefined) {
    updateData.referral_statuses = updates.referral_statuses.map(([id, status]) => [id, status as string])
  }

  if (updates.interested_profiles !== undefined) {
    updateData.interested_profiles = updates.interested_profiles.map(([id, ref]) => 
      [id, ref || null]
    )
  }
  if (updates.ignored_profiles !== undefined) {
    updateData.ignored_profiles = updates.ignored_profiles.map(([id, ref]) => 
      [id, ref || null]
    )
  }
  
  updateData.updated_at = new Date().toISOString()

  console.log('updateData', updateData)

  const { data, error } = await supabase
    .from('apartments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating apartment:', error)
    return null
  }

  return transformApartmentFromDB(data)
}

export async function deleteApartment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting apartment:', error)
    return false
  }

  return true
}

// New function to remove apartment and update lessor's profile
export async function removeApartmentListing(apartmentId: string, profileId: string): Promise<boolean> {
  try {
    // First, get the current lessor profile
    const profile = await getProfileById(profileId)
    if (!profile) {
      console.error('Lessor profile not found')
      return false
    }

    // Remove apartment from lessor's apartments_for_sale array
    const updatedApartments = profile.apartmentsForSale.filter(id => id !== apartmentId)
    const profileUpdateSuccess = await updateProfile(profileId, { 
      apartmentsForSale: updatedApartments 
    })

    if (!profileUpdateSuccess) {
      console.error('Failed to update lessor profile')
      return false
    }

    // Remove apartment from all users' apartments_interested maps
    const allProfiles = await getAllProfiles()
    for (const userProfile of allProfiles) {
      if (userProfile.apartmentsInterested.has(apartmentId)) {
        const updatedInterested = new Map(userProfile.apartmentsInterested)
        updatedInterested.delete(apartmentId)
        await updateProfile(userProfile.id, { apartmentsInterested: updatedInterested })
      }
    }

    // Finally, delete the apartment
    const deleteSuccess = await deleteApartment(apartmentId)
    if (!deleteSuccess) {
      console.error('Failed to delete apartment')
      return false
    }

    return true
  } catch (error) {
    console.error('Error removing apartment listing:', error)
    return false
  }
}

// Function to ignore a profile for a specific apartment
export async function ignoreProfileForApartment(apartmentId: string, profileId: string): Promise<boolean> {
  try {
    const [apartment, profile] = await Promise.all([
      getApartmentById(apartmentId),
      getProfileById(profileId)
    ])
    
    if (!apartment) {
      console.error('Apartment not found')
      return false
    }

    if (!profile) {
      console.error('Profile not found')
      return false
    }

    const currentInterestedProfiles = apartment.interested_profiles || []
    const currentIgnoredProfiles = apartment.ignored_profiles || []
    
    // Find the user in interested profiles (to preserve referrer info if any)
    const interestedEntry = currentInterestedProfiles.find(([id]) => id === profileId)
    
    // Remove from interested_profiles
    const updatedInterestedProfiles = currentInterestedProfiles.filter(([id]) => id !== profileId)
    
    // Add to ignored_profiles (preserve referrer info if it existed)
    const ignoredEntry: [string, string | null] = interestedEntry ? [interestedEntry[0], interestedEntry[1] ?? null] : [profileId, null]
    const updatedIgnoredProfiles = currentIgnoredProfiles.some(([id]) => id === profileId)
      ? currentIgnoredProfiles 
      : [...currentIgnoredProfiles, ignoredEntry]

    // Remove apartment from user's interested map and set status to 'Denied'
    const updatedUserInterests = new Map(profile.apartmentsInterested)
    updatedUserInterests.set(apartmentId, 'Denied')

    // console.log('updatedUserInterests', updatedIgnoredProfiles)
    // console.log('updatedInterestedProfiles', updatedInterestedProfiles)


    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      updateApartment(apartmentId, { 
        interested_profiles: updatedInterestedProfiles,
        ignored_profiles: updatedIgnoredProfiles
      }),
      updateProfile(profileId, {
        apartmentsInterested: updatedUserInterests
      })
    ])
    
    return apartmentSuccess !== null && profileSuccess !== null
  } catch (error) {
    console.error('Error ignoring profile for apartment:', error)
    return false
  }
}

// Function to restore an ignored profile for a specific apartment
export async function restoreProfileForApartment(apartmentId: string, profileId: string): Promise<boolean> {
  try {
    const [apartment, profile] = await Promise.all([
      getApartmentById(apartmentId),
      getProfileById(profileId)
    ])
    
    if (!apartment) {
      console.error('Apartment not found')
      return false
    }

    if (!profile) {
      console.error('Profile not found')
      return false
    }

    const hasInterest = await checkUserInterestInApartment(profileId, apartmentId)
    console.log('hasInterest', hasInterest)
    if (!hasInterest) {
      console.log('User is no longer interested in this apartment')
      return false
    }


    const currentInterestedProfiles = apartment.interested_profiles || []
    const currentIgnoredProfiles = apartment.ignored_profiles || []
    
    // Find the user in ignored profiles (to preserve referrer info if any)
    const ignoredEntry = currentIgnoredProfiles.find(([id]) => id === profileId)
    
    // Remove from ignored_profiles
    const updatedIgnoredProfiles = currentIgnoredProfiles.filter(([id]) => id !== profileId)
    
    // Add back to interested_profiles (preserve referrer info if it existed)
    const interestedEntry: [string, string | null] = ignoredEntry ? [ignoredEntry[0], ignoredEntry[1] ?? null] : [profileId, null]
    const updatedInterestedProfiles = currentInterestedProfiles.some(([id]) => id === profileId)
      ? currentInterestedProfiles
      : [...currentInterestedProfiles, interestedEntry]

    // Restore apartment in user's interested map with 'Available' status
    const updatedUserInterests = new Map(profile.apartmentsInterested)
    updatedUserInterests.set(apartmentId, 'Available')

    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      updateApartment(apartmentId, { 
        interested_profiles: updatedInterestedProfiles,
        ignored_profiles: updatedIgnoredProfiles
      }),
      updateProfile(profileId, {
        apartmentsInterested: updatedUserInterests
      })
    ])
    
    return apartmentSuccess !== null && profileSuccess !== null
  } catch (error) {
    console.error('Error restoring profile for apartment:', error)
    return false
  }
}

// Profile Database Operations
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return transformProfileFromDB(data)
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return transformProfileFromDB(data)
}

// export async function getProfileByPubkey(pubkey: string): Promise<Profile | null> {
//   const { data, error } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('pubkey', pubkey)
//     .single()

//   if (error) {
//     console.error('Error fetching profile:', error)
//     return null
//   }

//   return transformProfileFromDB(data)
// }

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data.map(transformProfileFromDB)
}

export async function createProfile(profile: Omit<Profile, 'apartmentsInterested' | 'apartmentsForSale'> & {
  apartmentsInterested?: Map<string, ApartmentStatus>
  apartmentsForSale?: string[]
}): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      username: profile.username,
      name: profile.name,
      bio: profile.bio,
      pubkey: profile.pubkey,
      reputation_score: profile.reputationScore,
      email: profile.email,
      apartments_interested: profile.apartmentsInterested ? Object.fromEntries(profile.apartmentsInterested) : {},
      apartments_for_sale: profile.apartmentsForSale || [],
      phone: profile.phone || null,
      referral_limit: profile.referral_limit,
      referral_statuses: profile.referral_statuses.map(([id, status]) => [id, status]),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    return null
  }

  return transformProfileFromDB(data)
}

export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .limit(1)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking username availability:', error)
    return false
  }

  return data.length === 0
}

export async function updateProfile(id: string, updates: Partial<Omit<Profile, 'id'>>): Promise<Profile | null> {
  // Check username uniqueness if username is being updated
  if (updates.username !== undefined) {
    const isAvailable = await checkUsernameAvailable(updates.username, id)
    if (!isAvailable) {
      console.error('Username is already taken')
      return null
    }
  }

  const updateData: any = {}
  
  if (updates.username !== undefined) updateData.username = updates.username
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.bio !== undefined) updateData.bio = updates.bio
  if (updates.pubkey !== undefined) updateData.pubkey = updates.pubkey
  if (updates.reputationScore !== undefined) updateData.reputation_score = updates.reputationScore
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.apartmentsInterested !== undefined) {
    updateData.apartments_interested = Object.fromEntries(updates.apartmentsInterested)
  }
  if (updates.apartmentsForSale !== undefined) updateData.apartments_for_sale = updates.apartmentsForSale
  if (updates.phone !== undefined) updateData.phone = updates.phone || null
  if (updates.referral_limit !== undefined) updateData.referral_limit = updates.referral_limit
  if (updates.referral_statuses !== undefined) {
    updateData.referral_statuses = updates.referral_statuses.map(([id, status]) => [id, status])
  }
  
  updateData.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return transformProfileFromDB(data)
}

// User-specific functions (now using profile IDs)
export async function getUserApartments(profileId: string, isLessor: boolean = false): Promise<Apartment[]> {
  const profile = await getProfileById(profileId)
  if (!profile) {
    return []
  }

  const apartmentIds = isLessor 
    ? profile.apartmentsForSale 
    : Array.from(profile.apartmentsInterested.keys())

  if (apartmentIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .in('id', apartmentIds)

  if (error) {
    console.error('Error fetching user apartments:', error)
    return []
  }

  return data.map(transformApartmentFromDB)
}


export async function getUserApartmentsByUsername(username: string, isLessor: boolean = false): Promise<Apartment[]> {
  const profile = await getProfileByUsername(username)
  if (!profile) {
    return []
  }

  const apartmentIds = isLessor 
    ? profile.apartmentsForSale 
    : Array.from(profile.apartmentsInterested.keys())

  if (apartmentIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .in('id', apartmentIds)

  if (error) {
    console.error('Error fetching user apartments:', error)
    return []
  }

  return data.map(transformApartmentFromDB)
}



export async function getInterestedProfiles(apartmentId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')

  if (error) {
    console.error('Error fetching interested profiles:', error)
    return []
  }

  // Filter profiles that have this apartment in their apartmentsInterested map
  const interestedProfiles = data
    .map(transformProfileFromDB)
    .filter(profile => profile.apartmentsInterested.has(apartmentId))

  return interestedProfiles
}

// DEPRECATED: Use markInterestInApartment instead for proper two-way relationship updates
// export async function addInterestToApartment(profileId: string, apartmentId: string, status: ApartmentStatus = 'Available'): Promise<boolean> {
//   console.warn('addInterestToApartment is deprecated, use markInterestInApartment instead')
//   return markInterestInApartment(profileId, apartmentId)
// }

// DEPRECATED: Use unmarkInterestInApartment instead for proper two-way relationship updates
// export async function removeInterestFromApartment(profileId: string, apartmentId: string): Promise<boolean> {
//   console.warn('removeInterestFromApartment is deprecated, use unmarkInterestInApartment instead')
//   return unmarkInterestInApartment(profileId, apartmentId)
// }

export async function updateApartmentInterestStatus(profileId: string, apartmentId: string, status: ApartmentStatus): Promise<boolean> {
  const profile = await getProfileById(profileId)
  if (!profile) {
    console.error('Profile not found')
    return false
  }

  if (!profile.apartmentsInterested.has(apartmentId)) {
    console.error('Profile is not interested in this apartment')
    return false
  }

  const updatedInterested = new Map(profile.apartmentsInterested)
  updatedInterested.set(apartmentId, status)
  const updatedProfile = await updateProfile(profileId, { apartmentsInterested: updatedInterested })
  
  return updatedProfile !== null
}

export async function getApartmentInterestStatus(profileId: string, apartmentId: string): Promise<ApartmentStatus | null> {
  const profile = await getProfileById(profileId)
  if (!profile) {
    return null
  }

  return profile.apartmentsInterested.get(apartmentId) || null
}

// New functions to handle apartment interest using interested_profiles field
export async function markInterestInApartment(profileId: string, apartmentId: string, referrerProfileId?: string): Promise<boolean> {
  try {
    const [apartment, profile] = await Promise.all([
      getApartmentById(apartmentId),
      getProfileById(profileId)
    ])
    
    if (!apartment) {
      console.error('Apartment not found')
      return false
    }

    if (!profile) {
      console.error('Profile not found')
      return false
    }

    if (apartment.owner === profileId) {
      console.error('User cannot mark interest in their own apartment')
      return false
    }

    
    const currentInterestedProfiles = apartment.interested_profiles || []
    
    
    // Check if user is already interested
    const existingEntry = currentInterestedProfiles.find(([id]) => id === profileId)
    if (existingEntry) {
      console.log('User already marked interest in this apartment')
      return true
    }


    // Add new interest entry with optional referrer to apartment
    const newEntry: [string, string | null] = referrerProfileId ? [profileId, referrerProfileId] : [profileId, null]
    const updatedInterestedProfiles = [...currentInterestedProfiles, newEntry]
    
    // Add apartment to user's interested map with 'Available' status
    const updatedUserInterests = new Map(profile.apartmentsInterested)
    updatedUserInterests.set(apartmentId, 'Available')
    
    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      updateApartment(apartmentId, { 
        interested_profiles: updatedInterestedProfiles,
        interested: apartment.interested + 1
      }),
      updateProfile(profileId, {
        apartmentsInterested: updatedUserInterests
      })
    ])
    
    return apartmentSuccess !== null && profileSuccess !== null
  } catch (error) {
    console.error('Error marking interest in apartment:', error)
    return false
  }
}

export async function unmarkInterestInApartment(profileId: string, apartmentId: string): Promise<boolean> {
  try {
    const [apartment, profile] = await Promise.all([
      getApartmentById(apartmentId),
      getProfileById(profileId)
    ])
    
    if (!apartment) {
      console.error('Apartment not found')
      return false
    }
    
    if (!profile) {
      console.error('Profile not found')
      return false
    }

    let currentProfiles = apartment.interested_profiles || []
    let ignore = false
    
    let hasInterest = currentProfiles.some(([id]) => id === profileId)
    if (!hasInterest) {
      // console.log('User has not marked interest in this apartment')
      // return true
      currentProfiles = apartment.ignored_profiles || []
      hasInterest = currentProfiles.some(([id]) => id === profileId)
      ignore = true
    }


    // Remove user's interest entry from apartment
    const updatedProfiles = currentProfiles.filter(([id]) => id !== profileId)
    
    // Remove apartment from user's interested map
    const updatedUserInterests = new Map(profile.apartmentsInterested)
    updatedUserInterests.delete(apartmentId)
    
    
    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      !ignore && updateApartment(apartmentId, { 
        interested_profiles: updatedProfiles,
        interested: Math.max(0, apartment.interested - 1)
      }),
      updateProfile(profileId, {
        apartmentsInterested: updatedUserInterests
      })
    ])
    
    return apartmentSuccess !== null && profileSuccess !== null
  } catch (error) {
    console.error('Error unmarking interest in apartment:', error)
  return false
  }
}

export async function checkUserInterestInApartment(profileId: string, apartmentId: string): Promise<boolean> {
  try {
    const [apartment, profile] = await Promise.all([
      getApartmentById(apartmentId),
      getProfileById(profileId)
    ])
    
    if (!apartment || !profile) {
      return false
    }

    // Check both the apartment's interested_profiles array and the user's apartmentsInterested map
    const inApartmentList = (apartment.interested_profiles || []).some(([id]) => id === profileId) || (apartment.ignored_profiles || []).some(([id]) => id === profileId) || []
    const inUserMap = profile.apartmentsInterested.has(apartmentId)
    
    // Return true if user is in the apartment's interested list AND has the apartment in their map
    // This ensures both sides of the relationship are consistent
    return inApartmentList && inUserMap
  } catch (error) {
    console.error('Error checking user interest in apartment:', error)
    return false
  }
}

// Helper functions to work with the new tuple structure
export function getInterestedProfileIds(apartment: Apartment): string[] {
  return (apartment.interested_profiles || []).map(([profileId]) => profileId)
}

export function getIgnoredProfileIds(apartment: Apartment): string[] {
  return (apartment.ignored_profiles || []).map(([profileId]) => profileId)
}

export function getReferrerForProfile(apartment: Apartment, profileId: string): string | null {
  const entry = apartment.interested_profiles?.find(([pid]) => pid === profileId) ||
                apartment.ignored_profiles?.find(([pid]) => pid === profileId)
  return entry?.[1] || null
}

export async function getInterestedProfilesWithReferrers(apartmentId: string): Promise<Array<{ profile: Profile, referrer: Profile | null }>> {
  const apartment = await getApartmentById(apartmentId)
  if (!apartment) return []

  const results: Array<{ profile: Profile, referrer: Profile | null }> = []
  
  for (const [profileId, referrerId] of apartment.interested_profiles || []) {
    const profile = await getProfileById(profileId)
    if (profile) {
      let referrer: Profile | null = null
      if (referrerId) {
        referrer = await getProfileById(referrerId)
      }
      results.push({ profile, referrer })
    }
  }
  
  return results
}

// Helper functions to transform database rows to our schema types
function transformApartmentFromDB(row: any): Apartment {
  return {
    id: row.id,
    owner: row.owner,
    image: row.image,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sqft: row.sqft,
    rent: row.rent,
    location: row.location,
    stake: row.stake,
    interested: row.interested,
    amenities: row.amenities,
    description: row.description || undefined,
    available_from: row.available_from || undefined,
    available_until: row.available_until || undefined,
    interested_profiles: (row.interested_profiles || []).map((item: any) => {
      if (Array.isArray(item)) {
        return [item[0], item[1] || null] as [string, string | null]
      }
      return [item, null] as [string, string | null]
    }),
    ignored_profiles: (row.ignored_profiles || []).map((item: any) => {
      if (Array.isArray(item)) {
        return [item[0], item[1] || null] as [string, string | null]
      }
      return [item, null] as [string, string | null]
    }),
    referral_limit: row.referral_limit,
    referral_statuses: (row.referral_statuses || []).map((item: any) => {
      if (Array.isArray(item)) {
        return [item[0], (item[1] || 'Accepted') as ReferralStatus] as [string, ReferralStatus]
      }
      return [item, 'Accepted' as ReferralStatus] as [string, ReferralStatus]
    }),
  }
}

function transformProfileFromDB(row: any): Profile {
  // Transform apartments_interested from JSON object to Map with proper type casting
  const apartmentsInterestedEntries = Object.entries(row.apartments_interested || {}).map(([aptId, status]) => 
    [aptId, status as ApartmentStatus] as [string, ApartmentStatus]
  )
  
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio,
    pubkey: row.pubkey,
    reputationScore: row.reputation_score,
    email: row.email,
    apartmentsInterested: new Map(apartmentsInterestedEntries),
    apartmentsRecommended: new Map(), // This field isn't in the database schema yet
    apartmentsForSale: row.apartments_for_sale,
    phone: row.phone || undefined,
    referral_limit: row.referral_limit,
    referral_statuses: (row.referral_statuses || []).map((item: any) => {
      if (Array.isArray(item)) {
        return [item[0], item[1]] as [string, string]
      }
      return [item, ''] as [string, string]
    }),
  }
}

// Initialize database with sample data
export async function seedDatabase() {
  // Check if data already exists
  const { data: existingApartments } = await supabase
    .from('apartments')
    .select('id')
    .limit(1)

  if (existingApartments && existingApartments.length > 0) {
    console.log('Database already seeded')
    return
  }

  // Seed profiles first to get their IDs
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert([
      {
        username: "john_doe",
        name: "Your Name",
        bio: "Real estate enthusiast and apartment owner. Looking to connect with great tenants.",
        pubkey: "EaT2NY6dYrsHdR4ETSJWGYY12JuQDReSaQ2QrCzuzaNf",
        reputation_score: 4.8,
        email: "your.email@example.com",
        apartments_interested: {},
        apartments_for_sale: [],
        phone: "+1-555-0123",
        referral_limit: 3,
        referral_statuses: [],
      },
      {
        username: "alice_smith",
        name: "Alice Smith",
        bio: "Software engineer at a tech startup. Love modern amenities and city life.",
        pubkey: "22222222222222222222222222222222",
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
        pubkey: "33333333333333333333333333333333",
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
        pubkey: "44444444444444444444444444444444",
        reputation_score: 4.7,
        email: "carol.williams@hospital.org",
        apartments_interested: {},
        apartments_for_sale: [],
        phone: "+1-555-0126",
        referral_limit: 4,
        referral_statuses: [],
      },
      {
        username: "david_brown",
        name: "David Brown",
        bio: "Recent graduate starting my first job. Looking for affordable housing.",
        pubkey: "55555555555555555555555555555555",
        reputation_score: 4.1,
        email: "david.brown@university.edu",
        apartments_interested: {},
        apartments_for_sale: [],
        phone: null,
        referral_limit: 0,
        referral_statuses: [],
      },
    ])
    .select()

  if (profileError) {
    console.error('Error seeding profiles:', profileError)
    return
  }

  const profileIds = profileData?.map(profile => profile.id) || []

  // Seed apartments with profile IDs as owners
  const { data: apartmentData, error: apartmentError } = await supabase
    .from('apartments')
    .insert([
      {
        owner: profileIds[0], // john_doe owns apartment 1
        image: "/apartments/apartment-1.jpg",
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1100,
        location: "Sunnyvale, CA",
        rent: 3200,
        stake: 1600,
        interested: 5,
        amenities: ["In-unit laundry", "Pool", "Gym"],
        description: "Beautiful 2-bedroom apartment with modern amenities and great location.",
        available_from: "2024-02-01",
        available_until: "2025-01-31",
        referral_limit: 5,
        referral_statuses: [],
        interested_profiles: [[profileIds[1]], [profileIds[2], profileIds[0]], [profileIds[3], profileIds[1]]],
        ignored_profiles: [],
      },
      {
        owner: profileIds[1], // alice_smith owns apartment 2
        image: "/apartments/apartment-2.jpg",
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        location: "San Francisco, CA",
        rent: 4500,
        stake: 2250,
        interested: 12,
        amenities: ["Rooftop deck", "Doorman"],
        description: "Luxury studio in the heart of San Francisco with stunning city views.",
        available_from: "2024-03-01",
        available_until: "2024-12-31",
        referral_limit: 3,
        referral_statuses: [],
        interested_profiles: [[profileIds[0]], [profileIds[2]]],
        ignored_profiles: [],
      },
      {
        owner: profileIds[2], // bob_johnson owns apartment 3
        image: "/apartments/apartment-3.jpg",
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 1600,
        location: "Oakland, CA",
        rent: 3800,
        stake: 1900,
        interested: 2,
        amenities: ["Backyard", "Garage parking"],
        description: "Spacious family home with private backyard and garage parking.",
        available_from: "2024-01-15",
        available_until: "2024-12-15",
        referral_limit: 4,
        referral_statuses: [],
        interested_profiles: [[profileIds[0]], [profileIds[3]]],
        ignored_profiles: [],
      },
      {
        owner: profileIds[3], // carol_williams owns apartment 4
        image: "/apartments/apartment-4.jpg",
        bedrooms: 0,
        bathrooms: 1,
        sqft: 500,
        location: "Berkeley, CA",
        rent: 2400,
        stake: 1200,
        interested: 8,
        amenities: ["Bike storage", "Pet friendly"],
        description: "Cozy studio apartment perfect for students, pet-friendly with bike storage.",
        available_from: "2024-02-15",
        available_until: "2024-08-15",
        referral_limit: 2,
        referral_statuses: [],
        interested_profiles: [[profileIds[0]], [profileIds[4]]],
        ignored_profiles: [],
      },
    ])
    .select()

  if (apartmentError) {
    console.error('Error seeding apartments:', apartmentError)
    return
  }

  // Update profiles with apartment relationships using Maps
  const apartmentIds = apartmentData?.map(apt => apt.id) || []

  // Update each profile with their apartment interests and ownership
  await Promise.all([
    // john_doe - owns apt 1, interested in apt 2,3,4
    updateProfile(profileIds[0], {
      apartmentsForSale: [apartmentIds[0]],
      apartmentsInterested: new Map([
        [apartmentIds[1], 'Available'],
        [apartmentIds[2], 'Pending'],
        [apartmentIds[3], 'Available']
      ]),
      referral_statuses: [
        [profileIds[2], 'Rewarded'], // Referred bob_johnson
        [profileIds[3], 'Accepted']  // Referred carol_williams
      ]
    }),
    // alice_smith - owns apt 2, interested in apt 1
    updateProfile(profileIds[1], {
      apartmentsForSale: [apartmentIds[1]],
      apartmentsInterested: new Map([
        [apartmentIds[0], 'Available']
      ]),
      referral_statuses: [
        [profileIds[3], 'Staked'] // Referred carol_williams
      ]
    }),
    // bob_johnson - owns apt 3, interested in apt 1,2
    updateProfile(profileIds[2], {
      apartmentsForSale: [apartmentIds[2]],
      apartmentsInterested: new Map([
        [apartmentIds[0], 'Staked'],
        [apartmentIds[1], 'Available']
      ])
    }),
    // carol_williams - owns apt 4, interested in apt 1,3
    updateProfile(profileIds[3], {
      apartmentsForSale: [apartmentIds[3]],
      apartmentsInterested: new Map([
        [apartmentIds[0], 'Pending'],
        [apartmentIds[2], 'Available']
      ])
    }),
    // david_brown - interested in apt 4
    updateProfile(profileIds[4], {
      apartmentsForSale: [],
      apartmentsInterested: new Map([
        [apartmentIds[3], 'Available']
      ])
    })
  ])

  console.log('Database seeded successfully with ID-based relationships and Map structure')
}

// Function to clear and reseed the database (useful for development)
export async function clearAndReseedDatabase() {
  try {
    // Clear existing data
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('apartments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('Database cleared')
    
    // Reseed with fresh data
    await seedDatabase()
  } catch (error) {
    console.error('Error clearing and reseeding database:', error)
  }
}