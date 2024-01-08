import { TestBed } from '@angular/core/testing';

import { ChangelogService } from './changelog.service';
import { ConfigService } from './config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('ChangelogService', () => {
  let service: ChangelogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [
        ConfigService,
      ]
    });
    service = TestBed.inject(ChangelogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
