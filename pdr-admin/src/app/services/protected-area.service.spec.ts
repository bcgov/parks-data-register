import { TestBed } from '@angular/core/testing';

import { ProtectedAreaService } from './protected-area.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from './config.service';

describe('ProtectedAreaService', () => {
  let service: ProtectedAreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [ConfigService],
    });
    service = TestBed.inject(ProtectedAreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
