import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaManageComponent } from './protected-area-manage.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProtectedAreaManageComponent', () => {
  let component: ProtectedAreaManageComponent;
  let fixture: ComponentFixture<ProtectedAreaManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaManageComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({})],
      providers: [ConfigService],
    });
    fixture = TestBed.createComponent(ProtectedAreaManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
