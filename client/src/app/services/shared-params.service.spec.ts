import { TestBed } from '@angular/core/testing';

import { SharedParamsService } from './shared-params.service';

describe('SharedParamsService', () => {
  let service: SharedParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedParamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});