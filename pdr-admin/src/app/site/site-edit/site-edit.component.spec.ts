import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteEditComponent } from './site-edit.component';

describe('SiteEditComponent', () => {
  let component: SiteEditComponent;
  let fixture: ComponentFixture<SiteEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteEditComponent]
    });
    fixture = TestBed.createComponent(SiteEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
