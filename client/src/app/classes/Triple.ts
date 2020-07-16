import { TrackDatas } from '../interfaces/TrackDatas';

export class Triple {
    mood: string;
    spotifyFeatures: TrackDatas;
    numFeedback: number;

    constructor() {
        this.mood = null;
        this.spotifyFeatures = {
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
        this.numFeedback = 0;
    }

    setMood(mood: string) {
        this.mood = mood;
    }

    setSpotifyFeatures(trackData: TrackDatas) {
        this.spotifyFeatures.acousticness = trackData.acousticness;
        this.spotifyFeatures.key = trackData.key;
        this.spotifyFeatures.mode = trackData.mode;
        this.spotifyFeatures.time_signature = trackData.time_signature;
        this.spotifyFeatures.acousticness = trackData.acousticness;
        this.spotifyFeatures.danceability = trackData.danceability;
        this.spotifyFeatures.energy = trackData.energy;
        this.spotifyFeatures.instrumentalness = trackData.instrumentalness;
        this.spotifyFeatures.liveness = trackData.liveness;
        this.spotifyFeatures.loudness = trackData.loudness;
        this.spotifyFeatures.speechiness = trackData.speechiness;
        this.spotifyFeatures.valence = trackData.valence;
        this.spotifyFeatures.tempo = trackData.tempo;
    }

    getMood() {
        return this.mood;
    }

    getSpotifyFeatures() {
        return this.spotifyFeatures;
    }
}
