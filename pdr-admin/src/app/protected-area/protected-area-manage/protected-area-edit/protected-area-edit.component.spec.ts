import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditComponent } from './protected-area-edit.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';

describe('ProtectedAreaEditComponent', () => {
  let component: ProtectedAreaEditComponent;
  let fixture: ComponentFixture<ProtectedAreaEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [ConfigService],
    });
    fixture = TestBed.createComponent(ProtectedAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
