// src/services/profileService.js
// Business Logic layer — user profile operations
import { profileRepository } from '../repositories/profileRepository';
import { User } from '../models/User';

export const profileService = {
    async getProfile(userId) {
        const data = await profileRepository.getByUserId(userId);
        return new User({
            id: userId,
            name: data.full_name,
            email: data.email,
            avatar: data.avatar_img,
        });
    },
};
