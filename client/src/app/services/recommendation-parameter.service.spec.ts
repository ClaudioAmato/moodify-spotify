import { TestBed } from '@angular/core/testing';

import { RecommendationParameterService as RecommendationParameterService } from './recommendation-parameter.service';

describe('RecommendationParameterService', () => {
  let service: RecommendationParameterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendationParameterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
