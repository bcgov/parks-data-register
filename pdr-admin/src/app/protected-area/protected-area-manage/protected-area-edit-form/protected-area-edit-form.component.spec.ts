import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditFormComponent } from './protected-area-edit-form.component';

describe('ProtectedAreaEditFormComponent', () => {
  let component: ProtectedAreaEditFormComponent;
  let fixture: ComponentFixture<ProtectedAreaEditFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditFormComponent]
    });
    fixture = TestBed.createComponent(ProtectedAreaEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
