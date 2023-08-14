import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  let mockConfigService = {
    config: {
      API_LOCATION: 'location',
      API_PATH: '/path',
      ENVIRONMENT: 'test',
    },
  };

  let mockQueryParams = {
    param1: 'value1',
    param2: 'value2',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        LoggerService,
      ],
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
    service.init();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.apiPath).toEqual('location/path');
    expect(service.env).toEqual('test');
  });

  it('gets the environment', async () => {
    expect(service.getEnvironment()).toEqual('test');
  });

  it('generates query string', async () => {
    expect(service['generateQueryString'](mockQueryParams)).toEqual(
      'param1=value1&param2=value2'
    );
  });

  it('gets', async () => {
    // no params
    service.get('getPk').subscribe((res) => {
      expect(res.params).toBeNull();
    });
    const emptyGet = httpTestingController.expectOne(
      `${service.apiPath}/getPk?`
    );
    expect(emptyGet.request.method).toEqual('GET');
    emptyGet.flush({ params: null });
    // with params
    service.get('getPk', mockQueryParams).subscribe((res) => {
      expect(res.params).toBeDefined();
      expect(res.params.param1).toEqual(mockQueryParams.param1);
      expect(res.params.param2).toEqual(mockQueryParams.param2);
    });
    let queryString = service['generateQueryString'](mockQueryParams);
    const paramGet = httpTestingController.expectOne(
      `${service.apiPath}/getPk?${queryString}`
    );
    expect(paramGet.request.method).toEqual('GET');
    paramGet.flush({ params: mockQueryParams });
  });

  it('puts', async () => {
    // no params
    service.put('putPk', { mockObj: 'mockObj' }).subscribe((res) => {
      expect(res.param).toBeNull();
    });
    const emptyPut = httpTestingController.expectOne(
      `${service.apiPath}/putPk?`
    );
    expect(emptyPut.request.method).toEqual('PUT');
    emptyPut.flush({ param: null });
    // with params
    service
      .put('putPk', { mockObj: 'mockObj' }, mockQueryParams)
      .subscribe((res) => {
        expect(res.params).toBeDefined();
        expect(res.params.param1).toEqual(mockQueryParams.param1);
        expect(res.params.param2).toEqual(mockQueryParams.param2);
      });
    let queryString = service['generateQueryString'](mockQueryParams);
    const paramPut = httpTestingController.expectOne(
      `${service.apiPath}/putPk?${queryString}`
    );
    expect(paramPut.request.method).toEqual('PUT');
    paramPut.flush({ params: mockQueryParams });
  });

  it('posts', async () => {
    // no params
    service.post('postPk', { mockObj: 'mockObj' }).subscribe((res) => {
      expect(res.param).toBeNull();
    });
    const emptyPost = httpTestingController.expectOne(
      `${service.apiPath}/postPk?`
    );
    expect(emptyPost.request.method).toEqual('POST');
    emptyPost.flush({ param: null });
    // with params
    service
      .post('postPk', { mockObj: 'mockObj' }, mockQueryParams)
      .subscribe((res) => {
        expect(res.params).toBeDefined();
        expect(res.params.param1).toEqual(mockQueryParams.param1);
        expect(res.params.param2).toEqual(mockQueryParams.param2);
      });
    let queryString = service['generateQueryString'](mockQueryParams);
    const paramPost = httpTestingController.expectOne(
      `${service.apiPath}/postPk?${queryString}`
    );
    expect(paramPost.request.method).toEqual('POST');
    paramPost.flush({ params: mockQueryParams });
  });

  it('deletes', async () => {
    // no params
    service.delete('deletePk').subscribe((res) => {
      expect(res.param).toBeNull();
    });
    const emptyDelete = httpTestingController.expectOne(
      `${service.apiPath}/deletePk?`
    );
    expect(emptyDelete.request.method).toEqual('DELETE');
    emptyDelete.flush({ param: null });
    // with params
    service.delete('deletePk', mockQueryParams).subscribe((res) => {
      expect(res.params).toBeDefined();
      expect(res.params.param1).toEqual(mockQueryParams.param1);
      expect(res.params.param2).toEqual(mockQueryParams.param2);
    });
    let queryString = service['generateQueryString'](mockQueryParams);
    const paramDelete = httpTestingController.expectOne(
      `${service.apiPath}/deletePk?${queryString}`
    );
    expect(paramDelete.request.method).toEqual('DELETE');
    paramDelete.flush({ params: mockQueryParams });
  });
});
