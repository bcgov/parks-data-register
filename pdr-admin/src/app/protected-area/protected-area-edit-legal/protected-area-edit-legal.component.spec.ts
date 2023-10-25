import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditLegalComponent } from './protected-area-edit-legal.component';

describe('ProtectedAreaEditLegalComponent', () => {
  let component: ProtectedAreaEditLegalComponent;
  let fixture: ComponentFixture<ProtectedAreaEditLegalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditLegalComponent]
    });
    fixture = TestBed.createComponent(ProtectedAreaEditLegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
