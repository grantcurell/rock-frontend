import { TestBed, inject } from '@angular/core/testing';

import { KickstartService } from './kickstart.service';

describe('KickstartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KickstartService]
    });
  });

  it('should be created', inject([KickstartService], (service: KickstartService) => {
    expect(service).toBeTruthy();
  }));
});
