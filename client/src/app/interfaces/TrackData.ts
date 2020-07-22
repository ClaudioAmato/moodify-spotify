import { TrackFeatures } from './TrackFeatures';

export interface TrackData {
    uriID: string,
    idTrack: string,
    artists_name: any[],
    image: any,
    currentlyPlayingPreview: boolean,
    currentlyPlayingSong: boolean,
    duration: number,
    album_name: string,
    preview_url: string,
    external_urls: string,
    features: TrackFeatures
}