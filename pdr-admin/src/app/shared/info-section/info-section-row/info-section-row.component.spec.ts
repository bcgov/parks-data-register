import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSectionRowComponent } from './info-section-row.component';

describe('InfoSectionRowComponent', () => {
  let component: InfoSectionRowComponent;
  let fixture: ComponentFixture<InfoSectionRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoSectionRowComponent]
    });
    fixture = TestBed.createComponent(InfoSectionRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
