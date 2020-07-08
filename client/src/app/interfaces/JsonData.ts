import { Tripla } from './../classes/tripla';
export interface JsonData {
    id?: any;
    user: string;
    date: string;
    moods: { startMood: string, targetMood: string };
    triples: Array<Tripla>;
}