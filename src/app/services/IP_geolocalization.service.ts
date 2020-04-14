import { IP_API } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Location {
    latitude: string;
    longitue: string;
    country_code: string;
    country_name: string;
    ip: string;
    city: string;
    region: string;
    postal: string;
    timezone: string;
}

@Injectable({
    providedIn: 'root'
})
export class IP_geolocalization {

    constructor(private _http: HttpClient) { }

    getLocation() {
        return this._http.get<Location>('http://api.ipapi.com/api/check?access_key=' + IP_API);
    }
}
