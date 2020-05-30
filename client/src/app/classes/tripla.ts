import { TrackDatas } from '../interfaces/TrackDatas';

export class Tripla {
    previusMood: string;
    newMood: string;
    spotifyData: TrackDatas;
    id: string;

    constructor(id: string) {
        this.spotifyData = {
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
        this.previusMood = null;
        this.newMood = null;
        this.id = id;
    }

    setPreviusMood(mood: string) {
        this.previusMood = mood;
    }
    setNewMood(mood: string) {
        this.newMood = mood;
    }
    setSpotifyData(
        duration_ms: number, key: number,
        mode: number, time_signature: number,
        acousticness: number, danceability: number,
        energy: number, instrumentalness: number,
        liveness: number, loudness: number,
        speechiness: number, valence: number,
        tempo: number
    ) {
        this.spotifyData.acousticness = acousticness;
        this.spotifyData.duration_ms = duration_ms;
        this.spotifyData.key = key;
        this.spotifyData.mode = mode;
        this.spotifyData.time_signature = time_signature;
        this.spotifyData.acousticness = acousticness;
        this.spotifyData.danceability = danceability;
        this.spotifyData.energy = energy;
        this.spotifyData.instrumentalness = instrumentalness;
        this.spotifyData.liveness = liveness;
        this.spotifyData.loudness = loudness;
        this.spotifyData.speechiness = speechiness;
        this.spotifyData.valence = valence;
        this.spotifyData.tempo = tempo;
    }

    getPreviusMood() {
        return this.previusMood;
    }
    getNewMood() {
        return this.newMood;
    }
    getSpotifyData() {
        return this.setSpotifyData;
    }
    getId() {
        return this.id;
    }
}
