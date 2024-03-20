import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDetailsComponent } from './site-details.component';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from 'src/app/shared/shared.module';

describe('SiteDetailsComponent', () => {
  let component: SiteDetailsComponent;
  let fixture: ComponentFixture<SiteDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteDetailsComponent],
      imports: [ToastrModule.forRoot(), SharedModule],
      providers: [ConfigService, HttpClient, HttpHandler]
    });
    fixture = TestBed.createComponent(SiteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
