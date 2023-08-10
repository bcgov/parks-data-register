import { TestBed } from '@angular/core/testing';

import { PdrAdminLibraryService } from './pdr-admin-library.service';

describe('PdrAdminLibraryService', () => {
  let service: PdrAdminLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PdrAdminLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
