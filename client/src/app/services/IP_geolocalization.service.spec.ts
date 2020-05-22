import { TestBed } from '@angular/core/testing';

import { IP_geolocalization } from './IP_geolocalization.service';

describe('SpotifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IP_geolocalization = TestBed.inject(IP_geolocalization);
    expect(service).toBeTruthy();
  });
});
