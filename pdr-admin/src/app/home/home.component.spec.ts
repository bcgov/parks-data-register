import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const fakeKeyCloakServiceIsAllowed = {
    isAllowed: () => true,
  };

  const fakeKeyCloakServiceNotAllowed = {
    isAllowed: () => false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [HomeComponent],
      providers: [{ KeycloakService, useValue: fakeKeyCloakServiceIsAllowed }, ConfigService, HttpClient, HttpHandler],
    }).compileComponents();
  });

  it('should create home cards wit site metrics', async () => {
    TestBed.overrideProvider(KeycloakService, {
      useValue: fakeKeyCloakServiceIsAllowed,
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    let cardElement = fixture.debugElement.nativeElement.getElementsByTagName('app-nav-card');
    expect(cardElement.length).toEqual(3);
    expect(cardElement[0].cardHeader === 'Parks Management');
    expect(cardElement[1].cardHeader === 'Pass Management');
    expect(cardElement[2].cardHeader === 'Site Metrics');
  });

  it('should create home cards without site metrics', async () => {
    TestBed.overrideProvider(KeycloakService, {
      useValue: fakeKeyCloakServiceNotAllowed,
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    let cardElement = fixture.debugElement.nativeElement.getElementsByTagName('app-nav-card');
    expect(cardElement.length).toEqual(2);
    expect(cardElement[0].cardHeader === 'Parks Management');
    expect(cardElement[1].cardHeader === 'Pass Management');
  });
});
