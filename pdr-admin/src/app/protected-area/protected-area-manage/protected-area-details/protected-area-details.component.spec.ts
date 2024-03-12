import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtectedAreaDetailsComponent } from './protected-area-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { ToastrModule } from 'ngx-toastr';
import { ProtectedAreaDetailsSectionComponent } from '../protected-area-details-section/protected-area-details-section.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SiteModule } from '../../site/site.module';

describe('ProtectedAreaDetailsComponent', () => {
  let component: ProtectedAreaDetailsComponent;
  let fixture: ComponentFixture<ProtectedAreaDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProtectedAreaDetailsComponent, ProtectedAreaDetailsSectionComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, ToastrModule.forRoot({}), SharedModule, SiteModule],
      providers: [ConfigService],
    });
    fixture = TestBed.createComponent(ProtectedAreaDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
