import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoggerService } from 'src/app/services/logger.service';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClient, HttpHandler } from '@angular/common/http';

import { InfiniteLoadingBarComponent } from './infinite-loading-bar.component';
import { LoadingService } from '../services/loading.service';

describe('InfiniteLoadingBarComponent', () => {
  let component: InfiniteLoadingBarComponent;
  let fixture: ComponentFixture<InfiniteLoadingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfiniteLoadingBarComponent],
      providers: [LoggerService, LoadingService, ConfigService, HttpClient, HttpHandler],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfiniteLoadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
