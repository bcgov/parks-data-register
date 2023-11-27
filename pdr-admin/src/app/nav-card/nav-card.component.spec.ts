import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavCardComponent } from './nav-card.component';

describe('NavCardComponent', () => {
  let component: NavCardComponent;
  let fixture: ComponentFixture<NavCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavCardComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NavCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates', async () => {
    const navSpy = spyOn(component['router'], 'navigate');
    component.navigate(['mock']);
    expect(navSpy).toHaveBeenCalledOnceWith(['mock']);
  });
});
