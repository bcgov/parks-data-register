import { TestBed } from '@angular/core/testing';

import { ProtectedAreaService } from './protected-area.service';

describe('ProtectedAreaService', () => {
  let service: ProtectedAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtectedAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
