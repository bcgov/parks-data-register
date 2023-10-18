import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaComponent } from './protected-area.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProtectedAreaComponent', () => {
  let component: ProtectedAreaComponent;
  let fixture: ComponentFixture<ProtectedAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaComponent],
      imports: [RouterTestingModule],
    });
    fixture = TestBed.createComponent(ProtectedAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
