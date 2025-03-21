import { TestBed } from '@angular/core/testing';

import { UrlService } from './url.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
    selector: 'app-mock-1',
    template: '',
    standalone: false
})
class Mock1Component {}

@Component({
    selector: 'app-mock-2',
    template: '',
    standalone: false
})
class Mock2Component {}

@Component({
    selector: 'app-mock-3',
    template: '',
    standalone: false
})
class Mock3Component {}

describe('UrlService', () => {
  let service: UrlService;
  let router: Router;
  let fixture;

  const routes: Routes = [
    { path: '', component: Mock1Component },
    { path: 'mock', component: Mock2Component, children: [{ path: 'mock-child', component: Mock3Component }] },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Mock1Component, Mock2Component],
      imports: [RouterTestingModule.withRoutes(routes)],
      providers: [],
    }).compileComponents();
    router = TestBed.inject(Router);
    router.navigate(['mock', 'mock-child'], { queryParams: { test: 'param' } });
    service = TestBed.inject(UrlService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Mock1Component);
    fixture = TestBed.createComponent(Mock2Component);
    fixture = TestBed.createComponent(Mock3Component);
    fixture.detectChanges();
    router.initialNavigation();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get route', () => {
    const res = service.getRoute();
    expect(res).toEqual('/mock/mock-child?test=param');
  });

  it('should get route path tags', () => {
    const res = service.getRoutePathTags();
    expect(res).toEqual(['mock', 'mock-child?test=param']);
  });

  it('should get query params', () => {
    const res = service.getQueryParams();
    expect(res).toEqual({ test: 'param' });
  });
});
