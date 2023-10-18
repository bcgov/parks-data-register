import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaDetailsComponent } from './protected-area-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ProtectedAreaDetailsSectionComponent } from '../protected-area-details-section/protected-area-details-section.component';

describe('ProtectedAreaDetailsComponent', () => {
  let component: ProtectedAreaDetailsComponent;
  let fixture: ComponentFixture<ProtectedAreaDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaDetailsComponent, ProtectedAreaDetailsSectionComponent],
      imports: [RouterTestingModule],
    });
    fixture = TestBed.createComponent(ProtectedAreaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
