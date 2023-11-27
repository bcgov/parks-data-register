import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BreadcrumbComponent } from './breadcrumb.component';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { ToastrModule } from 'ngx-toastr';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  let fakeConfigService = {
    config: {
      ENVIRONMENT: 'prod',
    },
  };

  let mockRoutes = [{ path: 'enter-data', component: BreadcrumbComponent, data: { icon: 'bi-circle' } }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(mockRoutes), ToastrModule.forRoot({})],
      declarations: [BreadcrumbComponent],
      providers: [{ provide: ConfigService, useValue: fakeConfigService }, KeycloakService, HttpClient, HttpHandler],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe on destroy', async () => {
    const subSpy = spyOn<any>(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(subSpy).toHaveBeenCalledTimes(1);
  });

  it('should navigate to enter-data', async () => {
    component.onNavigate('/enter-data');
    await fixture.isStable();
    fixture.detectChanges();
    expect(component['router'].url).toEqual('/enter-data');
  });
});
