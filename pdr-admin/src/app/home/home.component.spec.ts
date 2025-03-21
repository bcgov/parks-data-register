import { HttpClient, HttpHandler, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';

import { HomeComponent } from './home.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NavCardModule } from '../nav-card/nav-card.module';
import { ToastrModule } from 'ngx-toastr';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [HomeComponent],
    imports: [RouterTestingModule, NavCardModule, ToastrModule.forRoot({})],
    providers: [KeycloakService, ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
