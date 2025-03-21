import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLogComponent } from './change-log.component';
import { ConfigService } from '../services/config.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ChangeLogComponent', () => {
  let component: ChangeLogComponent;
  let fixture: ComponentFixture<ChangeLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [ChangeLogComponent],
    imports: [RouterTestingModule, ToastrModule.forRoot({}), NgdsFormsModule],
    providers: [
        ConfigService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    fixture = TestBed.createComponent(ChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
