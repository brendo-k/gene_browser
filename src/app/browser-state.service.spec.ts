import { TestBed } from '@angular/core/testing';

import { BrowserStateService } from './browser-state.service';

describe('BrowserStateService', () => {
  let service: BrowserStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
