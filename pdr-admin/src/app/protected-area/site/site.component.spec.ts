import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteComponent } from './site.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { ConfigService } from 'src/app/services/config.service';

describe('SiteComponent', () => {
  let component: SiteComponent;
  let fixture: ComponentFixture<SiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [ConfigService]
    });
    fixture = TestBed.createComponent(SiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
