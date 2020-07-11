import { UserPreferences } from './UserPreferences';
export interface UserProfile {
    preferences: UserPreferences,
    profilePhoto: any,
    email: string;
    name: string;
    url: string;
    country: string;
    ID: string;
}