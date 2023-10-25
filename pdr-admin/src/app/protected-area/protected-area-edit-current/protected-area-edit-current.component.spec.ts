import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditCurrentComponent } from './protected-area-edit-current.component';

describe('ProtectedAreaEditCurrentComponent', () => {
  let component: ProtectedAreaEditCurrentComponent;
  let fixture: ComponentFixture<ProtectedAreaEditCurrentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditCurrentComponent]
    });
    fixture = TestBed.createComponent(ProtectedAreaEditCurrentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
