import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProtectedAreaEditRepealComponent', () => {
  let component: ProtectedAreaEditRepealComponent;
  let fixture: ComponentFixture<ProtectedAreaEditRepealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ProtectedAreaEditRepealComponent],
    imports: [ToastrModule.forRoot({}), NgdsFormsModule],
    providers: [ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    fixture = TestBed.createComponent(ProtectedAreaEditRepealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
