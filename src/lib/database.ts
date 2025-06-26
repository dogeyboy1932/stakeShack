import { supabase } from './supabase'
import { Apartment, Profile, Booking, ApartmentStatus, ReferralStatus } from './schema'

// Paginated apartment fetching for lazy loading
export async function getApartmentsPaginated(
  page: number = 0, 
  limit: number = 20, 
  profile: Profile
): Promise<{ apartments: Apartment[], hasMore: boolean, total: number }> {
  const offset = page * limit
  
  // Get user exclusions if userId provided
  let excludeIds: string[] = [] 
  if (profile) {
    excludeIds = [
      ...profile.apartments_for_sale,
      ...Array.from(profile.apartments_interested.keys())
    ] 
  }

  // console.log('profile', profile);
  // console.log('apartments_for_sale', profile.apartments_for_sale);
  // console.log('apartments_interested', Array.from(profile.apartments_interested.keys()));

  // console.log('excludeIds', excludeIds);


  // Build count query with exclusions
  const { data: data, error: countError } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: false })
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .range(offset, offset + limit - 1);

  if (countError) {
    console.error('Error fetching apartments:', countError);
    return { apartments: [], hasMore: false, total: 0 };
  }
  
  // console.log('Final data:', data);

  const apartments = data.map(transformApartmentFromDB)
  const hasMore = offset + limit < data.length
  

  return { 
    apartments, 
    hasMore, 
    total: data.length
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
      reward: apartment.reward,
      interested: apartment.interested,
      amenities: apartment.amenities,
      description: apartment.description || null,
      available_from: apartment.available_from || null,
      available_until: apartment.available_until || null,
      interested_profiles: apartment.interested_profiles || [],
      ignored_profiles: apartment.ignored_profiles || [],
      referrers_pubkeys: apartment.referrers_pubkeys ? Object.fromEntries(apartment.referrers_pubkeys) : {},
      referral_limit: apartment.referral_limit,
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
  
  // console.log('id', id)
  // console.log('updates', updates)
  
  if (updates.owner !== undefined) updateData.owner = updates.owner
  if (updates.image !== undefined) updateData.image = updates.image
  if (updates.bedrooms !== undefined) updateData.bedrooms = updates.bedrooms
  if (updates.bathrooms !== undefined) updateData.bathrooms = updates.bathrooms
  if (updates.sqft !== undefined) updateData.sqft = updates.sqft
  if (updates.rent !== undefined) updateData.rent = updates.rent
  if (updates.location !== undefined) updateData.location = updates.location
  if (updates.stake !== undefined) updateData.stake = updates.stake
  if (updates.reward !== undefined) updateData.reward = updates.reward
  if (updates.interested !== undefined) updateData.interested = updates.interested
  if (updates.amenities !== undefined) updateData.amenities = updates.amenities
  if (updates.description !== undefined) updateData.description = updates.description || null
  if (updates.available_from !== undefined) updateData.available_from = updates.available_from || null
  if (updates.available_until !== undefined) updateData.available_until = updates.available_until || null
  if (updates.referral_limit !== undefined) updateData.referral_limit = updates.referral_limit
  if (updates.referrers_pubkeys !== undefined) {
    updateData.referrers_pubkeys = updates.referrers_pubkeys ? Object.fromEntries(updates.referrers_pubkeys) : {}
  }

  if (updates.interested_profiles !== undefined) {
    updateData.interested_profiles = updates.interested_profiles
  }
  if (updates.ignored_profiles !== undefined) {
    updateData.ignored_profiles = updates.ignored_profiles
  }
  if (updates.approved_profile !== undefined) {
    updateData.approved_profile = updates.approved_profile
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
    console.log('Error updating apartment:', error)
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
    const updatedApartments = profile.apartments_for_sale.filter(id => id !== apartmentId)
    const profileUpdateSuccess = await updateProfile(profileId, { 
      apartments_for_sale: updatedApartments 
    })

    if (!profileUpdateSuccess) {
      console.error('Failed to update lessor profile')
      return false
    }

    // Remove apartment from all users' apartments_interested maps
    const allProfiles = await getAllProfiles()
    for (const userProfile of allProfiles) {
      if (userProfile.apartments_interested.has(apartmentId)) {
        const updatedInterested = new Map(userProfile.apartments_interested)
        updatedInterested.delete(apartmentId)
        await updateProfile(userProfile.id, { apartments_interested: updatedInterested })
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

export async function createProfile(profile: Omit<Profile, 'apartments_interested' | 'apartments_for_sale'> & {
  apartments_interested?: Map<string, ApartmentStatus>
  apartments_for_sale?: string[]
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
      apartments_interested: profile.apartments_interested ? Object.fromEntries(profile.apartments_interested) : {},
      apartments_recommended: profile.apartments_recommended ? Object.fromEntries(profile.apartments_recommended) : {},
      apartments_for_sale: profile.apartments_for_sale || [],
      phone: profile.phone || null,
      referral_limit: profile.referral_limit,
      referral_statuses: Object.fromEntries(profile.referral_statuses),
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

  console.log("updates", updates)

  const updateData: any = {}
  
  if (updates.username !== undefined) updateData.username = updates.username
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.bio !== undefined) updateData.bio = updates.bio
  if (updates.pubkey !== undefined) updateData.pubkey = updates.pubkey
  if (updates.reputationScore !== undefined) updateData.reputation_score = updates.reputationScore
  if (updates.email !== undefined) updateData.email = updates.email
  if (updates.apartments_interested !== undefined) {
    updateData.apartments_interested = Object.fromEntries(updates.apartments_interested)
  }
  if (updates.apartments_recommended !== undefined) {
    updateData.apartments_recommended = Object.fromEntries(updates.apartments_recommended)
  }
  if (updates.apartments_for_sale !== undefined) updateData.apartments_for_sale = updates.apartments_for_sale
  if (updates.phone !== undefined) updateData.phone = updates.phone || null
  if (updates.referral_limit !== undefined) updateData.referral_limit = updates.referral_limit
  if (updates.referral_statuses !== undefined) {
    updateData.referral_statuses = Object.fromEntries(updates.referral_statuses)
  }
  
  updateData.updated_at = new Date().toISOString()

  // console.log('updateData', updateData)

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
    ? profile.apartments_for_sale 
    : Array.from(profile.apartments_interested.keys())

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
    ? profile.apartments_for_sale 
    : Array.from(profile.apartments_interested.keys())

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

  // Filter profiles that have this apartment in their apartments_interested map
  const interestedProfiles = data
    .map(transformProfileFromDB)
    .filter(profile => profile.apartments_interested.has(apartmentId))

  return interestedProfiles
}



// Helper function to validate apartment and profile exist
async function validateApartmentAndProfile(apartmentId: string, profileId: string) {
  const [apartment, profile] = await Promise.all([
    getApartmentById(apartmentId),
    getProfileById(profileId)
  ])
  
  if (!apartment || !profile) {
    console.error('Apartment or profile not found')
    return null
  }

  if (!profile.apartments_interested.has(apartmentId)) {
    console.error('Profile is not interested in this apartment')
    return null
  }

  return { apartment, profile }
}

// Helper function to find user entry in apartment lists
function findUserEntry(apartment: Apartment, profileId: string): string {
  const interestedProfiles = apartment.interested_profiles || []
  const ignoredProfiles = apartment.ignored_profiles || []
  
  return interestedProfiles.find(([id]) => id === profileId) || 
         ignoredProfiles.find(([id]) => id === profileId) || 
         profileId
}

// Helper function to update apartment lists based on status
function updateApartmentLists(apartment: Apartment, profileId: string, status: ApartmentStatus) {
  const interestedProfiles = apartment.interested_profiles || []
  const ignoredProfiles = apartment.ignored_profiles || []
  const userEntry = findUserEntry(apartment, profileId)

  const updatedInterested = status === 'Available' 
    ? [...interestedProfiles.filter(([id]) => id !== profileId), userEntry]
    : interestedProfiles.filter(([id]) => id !== profileId)

  const updatedIgnored = status === 'Denied'
    ? [...ignoredProfiles.filter(([id]) => id !== profileId), userEntry]
    : ignoredProfiles.filter(([id]) => id !== profileId)

  return { updatedInterested, updatedIgnored }
}



export async function updateApartmentInterestStatus(profileId: string, apartmentId: string, status: ApartmentStatus): Promise<boolean> {
  try {
    const validation = await validateApartmentAndProfile(apartmentId, profileId)
    if (!validation) return false

    const { apartment, profile } = validation
    const updatedUserInterests = new Map(profile.apartments_interested)
    updatedUserInterests.set(apartmentId, status)

    if (status === 'Denied' || status === 'Available') {
      const { updatedInterested, updatedIgnored } = updateApartmentLists(apartment, profileId, status)
      
      const [apartmentSuccess, profileSuccess] = await Promise.all([
        updateApartment(apartmentId, { 
          interested_profiles: updatedInterested,
          ignored_profiles: updatedIgnored
        }),
        updateProfile(profileId, { apartments_interested: updatedUserInterests })
      ])
      
      return apartmentSuccess !== null && profileSuccess !== null
    } else if (status === 'Approved' ) {
      console.log('Updating apartment approved profile to:', profileId)
      updateApartment(apartmentId, { 
        approved_profile: profileId
      })
    } else if (status === 'Pending') {
      console.log('Updating apartment approved profile to undefined')
      updateApartment(apartmentId, { 
        approved_profile: undefined
      })
    }

    // For statuses that don't require list changes (Pending, Approved, Staked, Confirmed)
    const profileSuccess = await updateProfile(profileId, { apartments_interested: updatedUserInterests })
    return profileSuccess !== null

  } catch (error) {
    console.error('Error updating apartment interest status:', error)
    return false
  }
}



export async function getApartmentInterestStatus(profileId: string, apartmentId: string): Promise<ApartmentStatus | null> {
  const profile = await getProfileById(profileId)
  if (!profile) {
    return null
  }

  return profile.apartments_interested.get(apartmentId) || null
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


    // Remove from recommended list
    const removeSuccess = await removeFromRecommendedList(profileId, apartment.id);
    if (removeSuccess) {
        console.log('Successfully removed from recommended list');
    } else {
        console.warn('Failed to remove from recommended list, but interest was marked');
    }

    
    const currentInterestedProfiles = apartment.interested_profiles || []
    
    
    // Check if user is already interested
    const existingEntry = currentInterestedProfiles.find(id => id === profileId)
    if (existingEntry) {
      console.log('User already marked interest in this apartment')
      return true
    }

    // Add new interest entry to apartment
    const updatedInterestedProfiles = [...currentInterestedProfiles, profileId]
    
    // Add apartment to user's interested map with 'Available' status
    const updatedUserInterests = new Map(profile.apartments_interested)
    updatedUserInterests.set(apartmentId, 'Available')

    // console.log('updatedInterestedProfiles', updatedInterestedProfiles)
    
    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      updateApartment(apartmentId, { 
        interested_profiles: updatedInterestedProfiles,
        interested: apartment.interested + 1
      }),
      updateProfile(profileId, {
        apartments_interested: updatedUserInterests
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

    if (apartment.referrers_pubkeys?.has(profileId)) { 
      apartment.referrers_pubkeys.delete(profileId)
    }

    let currentProfiles = apartment.interested_profiles || []
    let ignore = false
    
    let hasInterest = currentProfiles.some(id => id === profileId)
    if (!hasInterest) {
      currentProfiles = apartment.ignored_profiles || []
      hasInterest = currentProfiles.some(id => id === profileId)
      ignore = true
    }

    // Remove user's interest entry from apartment
    const updatedProfiles = currentProfiles.filter(id => id !== profileId)
    
    // Remove apartment from user's interested map
    const updatedUserInterests = new Map(profile.apartments_interested)
    updatedUserInterests.delete(apartmentId)
    
    
    // Update both apartment and profile
    const [apartmentSuccess, profileSuccess] = await Promise.all([
      !ignore && updateApartment(apartmentId, { 
        interested_profiles: updatedProfiles,
        interested: Math.max(0, apartment.interested - 1),
        referrers_pubkeys: apartment.referrers_pubkeys // Save the modified map
      }),
      updateProfile(profileId, {
        apartments_interested: updatedUserInterests
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

    // Check both the apartment's interested_profiles array and the user's apartments_interested map
    const inApartmentList = (apartment.interested_profiles || []).includes(profileId) || 
                           (apartment.ignored_profiles || []).includes(profileId)
    const inUserMap = profile.apartments_interested.has(apartmentId)
    
    // Return true if user is in the apartment's interested list AND has the apartment in their map
    // This ensures both sides of the relationship are consistent
    return inApartmentList && inUserMap
  } catch (error) {
    console.error('Error checking user interest in apartment:', error)
    return false
  }
}

// Helper functions to work with the string array structure
export function getInterestedProfileIds(apartment: Apartment): string[] {
  return apartment.interested_profiles || []
}

export function getIgnoredProfileIds(apartment: Apartment): string[] {
  return apartment.ignored_profiles || []
}

export function getReferrerForProfile(apartment: Apartment, profileId: string): string | null {
  // Check if this profile has a referrer in the referrers_pubkeys map
  return apartment.referrers_pubkeys?.get(profileId)?.toString() || null
}

export async function getInterestedProfilesWithReferrers(apartmentId: string): Promise<Array<{ profile: Profile, referrer: Profile | null }>> {
  const apartment = await getApartmentById(apartmentId)
  if (!apartment) return []

  const results: Array<{ profile: Profile, referrer: Profile | null }> = []
  
  for (const profileId of apartment.interested_profiles || []) {
    const profile = await getProfileById(profileId)
    if (profile) {
      let referrer: Profile | null = null
      // Check if this profile has a referrer in the referrers_pubkeys map
      const referrerPubkey = apartment.referrers_pubkeys?.get(profileId)
      if (referrerPubkey) {
        // Find referrer by pubkey - we'd need a new function for this
        // For now, set to null - this function might need redesign
        referrer = null
      }
      results.push({ profile, referrer })
    }
  }
  
  return results
}



export async function referUserToApartment(
  referrerProfileId: string, 
  referredUsername: string, 
  apartmentId: string
): Promise<{ success: boolean, message: string }> {
  try {
    // 1. Get the referrer profile to access their public key
    const referrerProfile = await getProfileById(referrerProfileId);
    if (!referrerProfile) {
      return { success: false, message: 'Referrer profile not found' };
    }

    // 2. Check if the username exists
    const referredProfile = await getProfileByUsername(referredUsername);
    if (!referredProfile) {
      return { success: false, message: 'Username not found' };
    }

    // 3. Get the apartment
    const apartment = await getApartmentById(apartmentId);
    if (!apartment) {
      return { success: false, message: 'Apartment not found' };
    }

    // 4. Check if the referred user is already interested or in the referrers list
    // const alreadyInterested = apartment.interested_profiles?.includes(referredProfile.id);
    // const alreadyIgnored = apartment.ignored_profiles?.includes(referredProfile.id);
    // const alreadyReferred = apartment.referrers?.some(([profileId]) => profileId === referredProfile.id);

    // if (alreadyInterested || alreadyIgnored || alreadyReferred) {
    //   return { success: false, message: 'User is already connected to this apartment' };
    // }


    // 5. Check if referrer can't refer themselves
    if (referrerProfile.id === referredProfile.id) {
      return { success: false, message: 'You cannot refer yourself' };
    }

    // 6. Add to referrers_pubkeys map: profile_id -> referrer_pubkey
    
    

    // 8. Update the referrer's referral statuses and add apartment to recommended
    const updatedReferralStatuses = new Map(referrerProfile.referral_statuses)
    const updatedApartmentsRecommended = new Map(referredProfile.apartments_recommended || new Map())
    
    updatedReferralStatuses.set(referredUsername, 'Referred')
    updatedApartmentsRecommended.set(apartmentId, referrerProfile.id)
    
    const referrerSuccess1 = await updateProfile(referrerProfileId, {
      referral_statuses: updatedReferralStatuses,
    })

    const referrerSuccess2 = await updateProfile(referredProfile.id, {
      apartments_recommended: updatedApartmentsRecommended
    })


    if (!referrerSuccess1 || !referrerSuccess2) {
      return { success: false, message: 'Failed to update referrer profile' };
    } else {
      return { success: true, message: `Successfully referred ${referredUsername}!` };
    }

  } catch (error) {
    console.error('Error referring user:', error);
    return { success: false, message: 'An error occurred while processing the referral' };
  }
}


export async function updateReferrerStatus(referrer: string, referredProfileId: string, status: ReferralStatus, apartmentId: string): Promise<boolean> {
  try {
    const referrerProfile = await getProfileById(referrer)
    if (!referrerProfile) {
      console.error('Profile not found')
      return false
    }

    const apartment = await getApartmentById(apartmentId)
    if (!apartment) {
      console.error('Apartment not found')
      return false
    }


    if (status === 'Accepted') {
      const updatedReferrers = new Map(apartment.referrers_pubkeys || new Map())
      updatedReferrers.set(referredProfileId, referrerProfile.pubkey)
      const success = await updateApartment(apartmentId, {
        referrers_pubkeys: updatedReferrers,
      });

      if (!success) {
        return false;
      } 
    } 


    const currentReferralStatuses = referrerProfile.referral_statuses || new Map()
    const updatedReferralStatuses = new Map(currentReferralStatuses)
    updatedReferralStatuses.set(referredProfileId, status)

    const profileSuccess = await updateProfile(referredProfileId, {
      referral_statuses: updatedReferralStatuses
    })
    

    return profileSuccess !== null

  } catch (error) {
    console.error('Error updating referrer status:', error)
    return false
  }
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
    reward: row.reward,
    interested: row.interested,
    amenities: row.amenities,
    description: row.description || undefined,
    available_from: row.available_from || undefined,
    available_until: row.available_until || undefined,
    interested_profiles: row.interested_profiles || [],
    ignored_profiles: row.ignored_profiles || [],
    referrers_pubkeys: row.referrers_pubkeys ? 
      new Map(Object.entries(row.referrers_pubkeys).map(([profileId, pubkey]) => 
        [profileId, pubkey]
      )) : new Map(),
    approved_profile: row.approved_profile || undefined,
    referral_limit: row.referral_limit,
  }
}

function transformProfileFromDB(row: any): Profile {
  // Transform apartments_interested from JSON object to Map with proper type casting
  const apartments_interestedEntries = Object.entries(row.apartments_interested || {}).map(([aptId, status]) => 
    [aptId, status as ApartmentStatus] as [string, ApartmentStatus]
  )
  
  // Transform apartments_recommended from JSON object to Map
  const apartments_recommendedEntries = Object.entries(row.apartments_recommended || {}).map(([aptId, referrerId]) => 
    [aptId, referrerId as string] as [string, string]
  )
  
  // Transform referral_statuses from JSON object to Map with proper type casting
  const referral_statusesEntries = Object.entries(row.referral_statuses || {}).map(([username, status]) => 
    [username, status as ReferralStatus] as [string, ReferralStatus]
  )
  
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio,
    pubkey: row.pubkey,
    reputationScore: row.reputation_score,
    email: row.email,
    apartments_interested: new Map(apartments_interestedEntries),
    apartments_recommended: new Map(apartments_recommendedEntries),
    apartments_for_sale: row.apartments_for_sale,
    phone: row.phone || undefined,
    referral_limit: row.referral_limit,
    referral_statuses: new Map(referral_statusesEntries),
  }
}

export async function removeFromRecommendedList(profileId: string, apartmentId: string): Promise<boolean> {
  try {
    const profile = await getProfileById(profileId)
    if (!profile) {
      console.error('Profile not found')
      return false
    }

    // Remove apartment from the user's recommended map
    const updatedRecommended = new Map(profile.apartments_recommended)
    const wasRemoved = updatedRecommended.delete(apartmentId)
    
    if (!wasRemoved) {
      console.log('Apartment was not in recommended list')
      return true // Not an error, just wasn't there
    }

    // Update the profile
    const success = await updateProfile(profileId, {
      apartments_recommended: updatedRecommended
    })

    return success !== null
  } catch (error) {
    console.error('Error removing from recommended list:', error)
    return false
  }
}