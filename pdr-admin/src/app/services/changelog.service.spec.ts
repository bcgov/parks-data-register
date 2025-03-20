import { TestBed } from '@angular/core/testing';

import { ChangelogService } from './changelog.service';
import { ConfigService } from './config.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ChangelogService', () => {
  let service: ChangelogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ToastrModule.forRoot({})],
    providers: [
        ConfigService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(ChangelogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
