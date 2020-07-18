import { TrackFeatures } from './TrackFeatures';
import { UserPreferences } from './UserPreferences';
export interface UserProfile {
    preferences: UserPreferences,
    targetFeatures: TrackFeatures,
    profilePhoto: any,
    email: string;
    name: string;
    url: string;
    country: string;
    ID: string;
}