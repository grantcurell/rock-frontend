import { TestBed, inject } from '@angular/core/testing';

import { ServerStdoutService } from './server-stdout.service';

describe('ServerStdoutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerStdoutService]
    });
  });

  it('should be created', inject([ServerStdoutService], (service: ServerStdoutService) => {
    expect(service).toBeTruthy();
  }));
});
