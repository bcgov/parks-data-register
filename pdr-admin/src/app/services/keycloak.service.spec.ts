import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { KeycloakService } from './keycloak.service';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';
import { ToastService } from './toast.service';
import { JwtUtil } from '../utils/jwt-utils';
import { ToastrModule } from 'ngx-toastr';

describe('KeycloakService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot({})],
      providers: [KeycloakService, ConfigService, LoggerService, ToastService, HttpClient, HttpHandler],
    });
  });

  it('idp should be `idir` if the token has an idir_userid property', () => {
    spyOn(JwtUtil, 'decodeToken').and.callFake(() => {
      return {
        idir_user_guid: '12345',
      };
    });
    const keycloak = TestBed.get(KeycloakService);
    spyOn(keycloak, 'getToken').and.callFake(() => {
      return 'not-empty';
    });
    const idp = keycloak.getIdpFromToken();
    expect(idp).toEqual('idir');
  });
});
