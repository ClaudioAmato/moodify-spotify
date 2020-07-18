import { TrackFeatures } from './TrackFeatures';

export interface TrackDatas {
    uriID: string,
    idTrack: string,
    nomi_artisti: any[],
    image: any,
    currentlyPlayingPreview: boolean,
    currentlyPlayingSong: boolean,
    duration: number,
    nome_album: string,
    preview_url: string,
    external_urls: string,
    features: TrackFeatures
}