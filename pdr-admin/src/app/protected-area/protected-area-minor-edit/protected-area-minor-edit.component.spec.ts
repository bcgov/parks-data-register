import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaMinorEditComponent } from './protected-area-minor-edit.component';

describe('ProtectedAreaMinorEditComponent', () => {
  let component: ProtectedAreaMinorEditComponent;
  let fixture: ComponentFixture<ProtectedAreaMinorEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaMinorEditComponent],
    });
    fixture = TestBed.createComponent(ProtectedAreaMinorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
