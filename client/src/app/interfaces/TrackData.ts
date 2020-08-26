import { TrackFeatures } from './TrackFeatures';

export interface TrackData {
    uriID: string,
    idTrack: string,
    artists_name: any[],
    image: any,
    currentlyPlayingPreview: boolean,
    currentlyPlayingSong: boolean,
    duration: number,
    song_name: string,
    album_name: string,
    release_date: string,
    preview_url: string,
    external_urls: string,
    features: TrackFeatures
}