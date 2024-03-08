import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteManageComponent } from './site-manage.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { ConfigService } from 'src/app/services/config.service';
import { SharedModule } from 'src/app/shared/shared.module';

describe('SiteManageComponent', () => {
  let component: SiteManageComponent;
  let fixture: ComponentFixture<SiteManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteManageComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({}), SharedModule],
      providers: [ConfigService]
    });
    fixture = TestBed.createComponent(SiteManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
