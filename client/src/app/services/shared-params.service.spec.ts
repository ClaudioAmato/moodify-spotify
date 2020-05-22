import { TestBed } from '@angular/core/testing';

import { SharedParamsService } from './shared-params.service';

describe('SharedParamsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharedParamsService = TestBed.get(SharedParamsService);
    expect(service).toBeTruthy();
  });
});
