import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private searchUrl: string;
  private marketQuery = '&market=';
  private limitQuery = '&limit=';
  private offsetQuery = '&offset=';

  constructor(private _http: HttpClient) {

  }

  /**
   *
   * @param q Search query keywords and optional field filters and operators.
   * @param type album , artist, playlist, track, show and episode.
   * @param market If a country code is specified, only content that is playable in that market is returned.
   * @param limit Maximum number of results to return. Default: 20 Minimum: 1 Maximum: 50
   * @param offset The index of the first result to return. Default: 0 (the first result). Maximum offset (including limit): 2,000
   */
  searchMusic(q: string, type: string, market: string, limit: number, offset: number, token: string) {
    if (q.length == 0 || type.length == 0) {
      return null;
    }
    else {
      q = encodeURIComponent(q);
      if (market !== null) {
        this.marketQuery.concat(market);
      }
      if (limit !== null) {
        this.limitQuery.concat(limit + '');

      }
      if (offset !== null) {
        this.offsetQuery.concat(offset + '');
      }
      this.searchUrl = 'https://api.spotify.com/v1/search?q=' + q +
        '&type=' + type + this.marketQuery + this.limitQuery + this.offsetQuery;

      let myheaders = new HttpHeaders();
      myheaders.append('Authorization', 'Bearer ' + token);

      return this._http.get(this.searchUrl, { headers: myheaders }).pipe(map((res: Response) => res.json()));

    }
  }
}
