import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditRepealComponent } from './protected-area-edit-repeal.component';

describe('ProtectedAreaEditRepealComponent', () => {
  let component: ProtectedAreaEditRepealComponent;
  let fixture: ComponentFixture<ProtectedAreaEditRepealComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditRepealComponent]
    });
    fixture = TestBed.createComponent(ProtectedAreaEditRepealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
