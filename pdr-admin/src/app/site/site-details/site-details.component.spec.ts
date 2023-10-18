import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteDetailsComponent } from './site-details.component';

describe('SiteDetailsComponent', () => {
  let component: SiteDetailsComponent;
  let fixture: ComponentFixture<SiteDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteDetailsComponent]
    });
    fixture = TestBed.createComponent(SiteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
