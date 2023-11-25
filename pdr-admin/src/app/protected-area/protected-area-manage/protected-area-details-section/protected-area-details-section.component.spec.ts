import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaDetailsSectionComponent } from './protected-area-details-section.component';

describe('ProtectedAreaDetailsSectionComponent', () => {
  let component: ProtectedAreaDetailsSectionComponent;
  let fixture: ComponentFixture<ProtectedAreaDetailsSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaDetailsSectionComponent]
    });
    fixture = TestBed.createComponent(ProtectedAreaDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
