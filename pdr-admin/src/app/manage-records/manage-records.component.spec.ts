import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRecordsComponent } from './manage-records.component';
import { NgdsFormsModule } from '@digitalspace/ngds-forms';

describe('ManageRecordsComponent', () => {
  let component: ManageRecordsComponent;
  let fixture: ComponentFixture<ManageRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageRecordsComponent],
      imports: [NgdsFormsModule],
    });
    fixture = TestBed.createComponent(ManageRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
