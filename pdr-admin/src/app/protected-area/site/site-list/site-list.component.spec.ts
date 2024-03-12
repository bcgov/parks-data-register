import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteListComponent } from './site-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';

describe('SiteListComponent', () => {
  let component: SiteListComponent;
  let fixture: ComponentFixture<SiteListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteListComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [ConfigService]
    });
    fixture = TestBed.createComponent(SiteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
