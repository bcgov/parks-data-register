import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';

describe('ProtectedAreaEditRepealComponent', () => {
  let component: ProtectedAreaEditRepealComponent;
  let fixture: ComponentFixture<ProtectedAreaEditRepealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditRepealComponent],
      imports: [HttpClientTestingModule, ToastrModule.forRoot({}), NgdsFormsModule],
      providers: [ConfigService],
    });
    fixture = TestBed.createComponent(ProtectedAreaEditRepealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
