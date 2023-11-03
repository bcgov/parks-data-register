import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRecordsComponent } from './manage-records.component';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';
import { HttpClientModule } from '@angular/common/http';
import { ConfigService } from '../services/config.service';
import { ToastrModule } from 'ngx-toastr';

describe('ManageRecordsComponent', () => {
  let component: ManageRecordsComponent;
  let fixture: ComponentFixture<ManageRecordsComponent>;

  let mockConfigService = {
    config: {
      API_LOCATION: 'location',
      API_PATH: '/path',
      ENVIRONMENT: 'test',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRecordsComponent],
      imports: [NgdsFormsModule, HttpClientModule, ToastrModule.forRoot({})],
      providers: [{ provide: ConfigService, useValue: mockConfigService }],
    });
    fixture = TestBed.createComponent(ManageRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
