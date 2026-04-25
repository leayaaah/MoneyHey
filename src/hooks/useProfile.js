// src/hooks/useProfile.js
// Adapter layer — bridges profileService with React state
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { User } from '../models/User';

export function useProfile() {
    const [user, setUser] = useState(new User({}));

    useEffect(() => {
        (async () => {
            try {
                const authUser = await authService.getUser();
                if (!authUser) return;
                const profile = await profileService.getProfile(authUser.id);
                setUser(profile);
            } catch (err) {
                console.error('Lỗi khi tải profile:', err);
            }
        })();
    }, []);

    return { user };
}
