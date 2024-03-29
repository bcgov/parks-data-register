import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaManageComponent } from './protected-area-manage.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';

describe('ProtectedAreaManageComponent', () => {
  let component: ProtectedAreaManageComponent;
  let fixture: ComponentFixture<ProtectedAreaManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaManageComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, ToastrModule.forRoot({}), SharedModule],
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
