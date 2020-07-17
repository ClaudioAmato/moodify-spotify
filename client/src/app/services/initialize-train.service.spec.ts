import { TestBed } from '@angular/core/testing';

import { InitializeTrainService } from './initialize-train.service';

describe('InitializeTrainService', () => {
  let service: InitializeTrainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InitializeTrainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
