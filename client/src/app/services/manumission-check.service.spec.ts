import { TestBed } from '@angular/core/testing';

import { ManumissionCheckService } from './manumission-check.service';

describe('ManumissionCheckService', () => {
  let service: ManumissionCheckService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManumissionCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
