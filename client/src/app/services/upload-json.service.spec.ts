import { TestBed } from '@angular/core/testing';

import { UploadJSONService } from './upload-json.service';

describe('UploadJSONService', () => {
  let service: UploadJSONService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadJSONService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
