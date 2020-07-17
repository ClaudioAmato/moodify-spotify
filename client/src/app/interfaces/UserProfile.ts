import { TrackDatas } from './TrackDatas';
import { UserPreferences } from './UserPreferences';
export interface UserProfile {
    preferences: UserPreferences,
    targetFeatures: TrackDatas,
    profilePhoto: any,
    email: string;
    name: string;
    url: string;
    country: string;
    ID: string;
}