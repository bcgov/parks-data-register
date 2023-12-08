import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaSearchComponent } from './protected-area-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProtectedAreaSearchComponent', () => {
  let component: ProtectedAreaSearchComponent;
  let fixture: ComponentFixture<ProtectedAreaSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaSearchComponent],
      imports: [HttpClientTestingModule, ToastrModule.forRoot({}), NgdsFormsModule, RouterTestingModule],
      providers: [ConfigService],
    });
    fixture = TestBed.createComponent(ProtectedAreaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
