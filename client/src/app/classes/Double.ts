import { TrackFeatures } from './../interfaces/TrackFeatures';

export class Double {
    mood: string;
    spotifyFeatures: TrackFeatures;

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
            popularity: null
        };
    }

    setMood(mood: string) {
        this.mood = mood;
    }

    setSpotifyFeatures(trackFeatures: TrackFeatures) {
        this.spotifyFeatures.acousticness = trackFeatures.acousticness;
        this.spotifyFeatures.key = trackFeatures.key;
        this.spotifyFeatures.mode = trackFeatures.mode;
        this.spotifyFeatures.time_signature = trackFeatures.time_signature;
        this.spotifyFeatures.acousticness = trackFeatures.acousticness;
        this.spotifyFeatures.danceability = trackFeatures.danceability;
        this.spotifyFeatures.energy = trackFeatures.energy;
        this.spotifyFeatures.instrumentalness = trackFeatures.instrumentalness;
        this.spotifyFeatures.liveness = trackFeatures.liveness;
        this.spotifyFeatures.loudness = trackFeatures.loudness;
        this.spotifyFeatures.speechiness = trackFeatures.speechiness;
        this.spotifyFeatures.valence = trackFeatures.valence;
        this.spotifyFeatures.tempo = trackFeatures.tempo;
        this.spotifyFeatures.popularity = trackFeatures.popularity;
    }

    getMood() {
        return this.mood;
    }

    getSpotifyFeatures() {
        return this.spotifyFeatures;
    }
}
