import { TestBed } from '@angular/core/testing';

import { GenomeService } from './genome.service';

describe('GenomeService', () => {
  let service: GenomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
