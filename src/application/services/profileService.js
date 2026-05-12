import { fetchProfileByUserId } from '../../infrastructure/repositories/profileRepository'

export const getProfile = async (userId) => fetchProfileByUserId(userId)
