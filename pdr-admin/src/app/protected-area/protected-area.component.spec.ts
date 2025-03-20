import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaComponent } from './protected-area.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from '../services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProtectedAreaComponent', () => {
  let component: ProtectedAreaComponent;
  let fixture: ComponentFixture<ProtectedAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ProtectedAreaComponent],
    imports: [RouterTestingModule, ToastrModule.forRoot({})],
    providers: [ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    fixture = TestBed.createComponent(ProtectedAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
