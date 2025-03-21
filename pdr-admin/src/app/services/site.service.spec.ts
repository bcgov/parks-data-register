import { TestBed } from '@angular/core/testing';

import { SiteService } from './site.service';
import { ConfigService } from './config.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SiteService', () => {
  let service: SiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ToastrModule.forRoot({})],
    providers: [ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(SiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
