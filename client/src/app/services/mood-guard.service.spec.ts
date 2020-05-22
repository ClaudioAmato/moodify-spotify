import { TestBed } from '@angular/core/testing';

import { MoodGuardService } from './mood-guard.service';

describe('MoodGuardService', () => {
  let service: MoodGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoodGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
