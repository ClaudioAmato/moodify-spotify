import { TestBed } from '@angular/core/testing';

import { PreferencesServices } from './preferences.service';

describe('PreferencesServices', () => {
  let service: PreferencesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
