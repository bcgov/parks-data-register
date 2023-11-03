import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { HomeComponent } from 'src/app/home/home.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { SideBarService } from 'src/app/services/sidebar.service';

import { SidebarComponent } from './sidebar.component';
import { ToastrModule } from 'ngx-toastr';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let activatedRoute;
  let router;

  let mockRoutes = [
    { path: 'mock1', component: HomeComponent, data: { icon: 'bi-circle' } },
    { path: 'mock2', component: HomeComponent, data: { icon: 'bi-circle' } },
  ];

  let mockSideBarService = {
    routes: new BehaviorSubject(mockRoutes),
    toggleChange: new BehaviorSubject(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      imports: [RouterTestingModule.withRoutes(mockRoutes), ToastrModule.forRoot({})],
      providers: [
        KeycloakService,
        ConfigService,
        HttpClient,
        HttpHandler,
        { provide: SideBarService, useValue: mockSideBarService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    activatedRoute = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.routes.length).toEqual(2);
    expect(component.hide).toBeFalse();
  });

  it('should navigate', async () => {
    const navSpy = spyOn(component['router'], 'navigate');
    const links = fixture.debugElement.nativeElement.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
      links[i].click();
      expect(navSpy).toHaveBeenCalledWith([mockRoutes[i].path]);
    }
  });

  it('gets path from url', async () => {
    expect(component.getPathFromUrl(component['router'].url)).toEqual('/');
    component.onNavigate('mock1');
    await fixture.isStable();
    fixture.detectChanges();
    expect(component.getPathFromUrl(component['router'].url)).toEqual('/mock1');
  });
});
