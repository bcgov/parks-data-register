import { TestBed } from '@angular/core/testing';

import { SiteService } from './site.service';
import { ConfigService } from './config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('SiteService', () => {
  let service: SiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule,ToastrModule.forRoot({})],
      providers: [ConfigService]
    });
    service = TestBed.inject(SiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
