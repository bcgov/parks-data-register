import { TestBed } from '@angular/core/testing';

import { ChangelogService } from './changelog.service';

describe('ChangelogService', () => {
  let service: ChangelogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangelogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
