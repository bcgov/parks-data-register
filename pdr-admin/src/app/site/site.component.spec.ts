import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteComponent } from './site.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SiteComponent', () => {
  let component: SiteComponent;
  let fixture: ComponentFixture<SiteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteComponent],
      imports: [RouterTestingModule],
    });
    fixture = TestBed.createComponent(SiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
