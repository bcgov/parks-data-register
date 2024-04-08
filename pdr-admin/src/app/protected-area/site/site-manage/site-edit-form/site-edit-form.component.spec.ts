import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditFormComponent } from './site-edit-form.component';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('SiteEditFormComponent', () => {
  let component: SiteEditFormComponent;
  let fixture: ComponentFixture<SiteEditFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteEditFormComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot({}), NgdsFormsModule],
      providers: [ConfigService]
    });
    fixture = TestBed.createComponent(SiteEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
