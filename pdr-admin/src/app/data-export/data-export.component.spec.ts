import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataExportComponent } from './data-export.component';

describe('DataExportComponent', () => {
  let component: DataExportComponent;
  let fixture: ComponentFixture<DataExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataExportComponent]
    });
    fixture = TestBed.createComponent(DataExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
