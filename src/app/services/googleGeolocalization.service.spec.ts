import { TestBed } from '@angular/core/testing';

import { GoogleGeolocalization } from './googleGeolocalization.service';

describe('SpotifyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoogleGeolocalization = TestBed.inject(GoogleGeolocalization);
    expect(service).toBeTruthy();
  });
});
