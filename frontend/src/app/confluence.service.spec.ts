import { TestBed, inject } from '@angular/core/testing';

import { ConfluenceService } from './confluence.service';

describe('ConfluenceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfluenceService]
    });
  });

  it('should be created', inject([ConfluenceService], (service: ConfluenceService) => {
    expect(service).toBeTruthy();
  }));
});
