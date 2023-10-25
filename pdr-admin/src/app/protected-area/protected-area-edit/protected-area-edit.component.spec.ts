import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaEditComponent } from './protected-area-edit.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProtectedAreaEditComponent', () => {
  let component: ProtectedAreaEditComponent;
  let fixture: ComponentFixture<ProtectedAreaEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaEditComponent],
      imports: [RouterTestingModule],
    });
    fixture = TestBed.createComponent(ProtectedAreaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
