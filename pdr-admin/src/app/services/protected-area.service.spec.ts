import { TestBed } from '@angular/core/testing';

import { ProtectedAreaService } from './protected-area.service';
import { ToastrModule } from 'ngx-toastr';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from './config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProtectedAreaService', () => {
  let service: ProtectedAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ToastrModule.forRoot({})],
    providers: [ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    service = TestBed.inject(ProtectedAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
