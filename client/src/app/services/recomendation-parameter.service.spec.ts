import { TestBed } from '@angular/core/testing';

import { RecomendationParameterService } from './recomendation-parameter.service';

describe('RecomendationParameterService', () => {
  let service: RecomendationParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecomendationParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
