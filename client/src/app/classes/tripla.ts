import { TrackDatas } from '../interfaces/TrackDatas';

export class Tripla {
    previusMood: string;
    spotifyDataPrevious: TrackDatas;
    spotifyDataCurrent: TrackDatas;

    constructor() {
        this.previusMood = null;
        this.spotifyDataPrevious = {
            id: null,
            duration_ms: null,
            key: null,
            mode: null,
            time_signature: null,
            acousticness: null,
            danceability: null,
            energy: null,
            instrumentalness: null,
            liveness: null,
            loudness: null,
            speechiness: null,
            valence: null,
            tempo: null,
        };
        this.spotifyDataCurrent = {
            id: null,
            duration_ms: null,
            key: null,
            mode: null,
            time_signature: null,
            acousticness: null,
            danceability: null,
            energy: null,
            instrumentalness: null,
            liveness: null,
            loudness: null,
            speechiness: null,
            valence: null,
            tempo: null,
        };
    }

    setPreviusMood(mood: string) {
        this.previusMood = mood;
    }

    setPreviousSpotifyData(trackData: TrackDatas) {
        this.spotifyDataPrevious.id = trackData.id
        this.spotifyDataPrevious.acousticness = trackData.acousticness;
        this.spotifyDataPrevious.duration_ms = trackData.duration_ms;
        this.spotifyDataPrevious.key = trackData.key;
        this.spotifyDataPrevious.mode = trackData.mode;
        this.spotifyDataPrevious.time_signature = trackData.time_signature;
        this.spotifyDataPrevious.acousticness = trackData.acousticness;
        this.spotifyDataPrevious.danceability = trackData.danceability;
        this.spotifyDataPrevious.energy = trackData.energy;
        this.spotifyDataPrevious.instrumentalness = trackData.instrumentalness;
        this.spotifyDataPrevious.liveness = trackData.liveness;
        this.spotifyDataPrevious.loudness = trackData.loudness;
        this.spotifyDataPrevious.speechiness = trackData.speechiness;
        this.spotifyDataPrevious.valence = trackData.valence;
        this.spotifyDataPrevious.tempo = trackData.tempo;
    }

    setCurrentSpotifyData(trackData: TrackDatas) {
        this.spotifyDataCurrent.id = trackData.id
        this.spotifyDataCurrent.acousticness = trackData.acousticness;
        this.spotifyDataCurrent.duration_ms = trackData.duration_ms;
        this.spotifyDataCurrent.key = trackData.key;
        this.spotifyDataCurrent.mode = trackData.mode;
        this.spotifyDataCurrent.time_signature = trackData.time_signature;
        this.spotifyDataCurrent.acousticness = trackData.acousticness;
        this.spotifyDataCurrent.danceability = trackData.danceability;
        this.spotifyDataCurrent.energy = trackData.energy;
        this.spotifyDataCurrent.instrumentalness = trackData.instrumentalness;
        this.spotifyDataCurrent.liveness = trackData.liveness;
        this.spotifyDataCurrent.loudness = trackData.loudness;
        this.spotifyDataCurrent.speechiness = trackData.speechiness;
        this.spotifyDataCurrent.valence = trackData.valence;
        this.spotifyDataCurrent.tempo = trackData.tempo;
    }

    getMood() {
        return this.previusMood;
    }

    getPreviousSpotifyData() {
        return this.spotifyDataPrevious;
    }

    getCurrentSpotifyData() {
        return this.spotifyDataCurrent;
    }
}
