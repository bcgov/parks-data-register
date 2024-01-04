import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeLogComponent } from './change-log.component';
import { ConfigService } from '../services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';

describe('ChangeLogComponent', () => {
  let component: ChangeLogComponent;
  let fixture: ComponentFixture<ChangeLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeLogComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot({}), NgdsFormsModule ],
      providers: [
        ConfigService,
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
