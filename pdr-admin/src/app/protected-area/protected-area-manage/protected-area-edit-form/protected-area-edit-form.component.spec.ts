import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditFormComponent } from './protected-area-edit-form.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProtectedAreaEditFormComponent', () => {
  let component: ProtectedAreaEditFormComponent;
  let fixture: ComponentFixture<ProtectedAreaEditFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ProtectedAreaEditFormComponent],
    imports: [ToastrModule.forRoot({}), NgdsFormsModule],
    providers: [ConfigService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    fixture = TestBed.createComponent(ProtectedAreaEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
