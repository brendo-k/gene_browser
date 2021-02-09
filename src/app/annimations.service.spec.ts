import { TestBed } from '@angular/core/testing';

import { AnnimationsService } from './annimations.service';

describe('AnnimationsService', () => {
  let service: AnnimationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnimationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
