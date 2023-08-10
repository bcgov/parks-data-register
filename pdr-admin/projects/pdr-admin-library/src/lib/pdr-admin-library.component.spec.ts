import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdrAdminLibraryComponent } from './pdr-admin-library.component';

describe('PdrAdminLibraryComponent', () => {
  let component: PdrAdminLibraryComponent;
  let fixture: ComponentFixture<PdrAdminLibraryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdrAdminLibraryComponent]
    });
    fixture = TestBed.createComponent(PdrAdminLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
