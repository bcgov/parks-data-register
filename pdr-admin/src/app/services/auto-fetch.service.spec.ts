import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AutoFetchService } from './auto-fetch.service';
import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';
import { ApiService } from './api.service';

describe('AutoFetchService', () => {
  let service: AutoFetchService;

  let mockLoggerService = {
    debug: (str) => {
      return 'debug';
    },
  };

  let mockAPIService = {
    get isNetworkOffline(): boolean {
      return false;
    },
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        HttpClient,
        HttpHandler,
        ConfigService,
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: ApiService, useValue: mockAPIService },
      ],
    });
    service = TestBed.inject(AutoFetchService);
    service.timeIntevalSeconds = 1;
    // https://github.com/gruntjs/grunt-contrib-jasmine/issues/213
    // Receiving error unless uninstall/install are both in beforeEach
    // likely due to async nature of tests
    jasmine.clock().uninstall();
    jasmine.clock().install();
  });

  afterAll(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.fetchQueue).toBeDefined();
  });

  it('fetches the queue', async () => {
    const fetchSpy = spyOn(service, 'runFetches').and.callThrough();
    await service.run();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    jasmine.clock().tick(1001);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('ignores order compare: Both inputs must be arrays.', async () => {
    const loggerSpy = spyOn(mockLoggerService, 'debug').and.callThrough();
    const res = service.ignoreOrderCompare([], 42);
    expect(loggerSpy).toHaveBeenCalledOnceWith('Both inputs must be arrays.');
    expect(res).toEqual(false);
  });

  it('ignores order compare: Arrays have different sizes.', async () => {
    const loggerSpy = spyOn(mockLoggerService, 'debug').and.callThrough();
    const res = service.ignoreOrderCompare([], [{}]);
    expect(loggerSpy).toHaveBeenCalledOnceWith('Arrays have different sizes.');
    expect(res).toEqual(false);
  });

  it('ignores order compare: Arrays have different sizes.', async () => {
    const loggerSpy = spyOn(mockLoggerService, 'debug').and.callThrough();
    const res = service.ignoreOrderCompare([], [{}]);
    expect(loggerSpy).toHaveBeenCalledOnceWith('Arrays have different sizes.');
    expect(res).toEqual(false);
  });

  it('ignores order compare: Object element count is different.', async () => {
    const loggerSpy = spyOn(mockLoggerService, 'debug').and.callThrough();
    const res = service.ignoreOrderCompare([{ element: 1 }], [{}]);
    expect(loggerSpy).toHaveBeenCalledOnceWith('Object not found or has a different count: {}');
    expect(res).toEqual(false);
  });

  it('ignores order compare: Different values.', async () => {
    const loggerSpy = spyOn(mockLoggerService, 'debug').and.callThrough();
    const res = service.ignoreOrderCompare([{ element: 1 }], [{ element: 2 }]);
    expect(loggerSpy).toHaveBeenCalledOnceWith('Object not found or has a different count: {"element":2}');
    expect(res).toEqual(false);
  });

  it('ignores order compare: success.', async () => {
    const res = service.ignoreOrderCompare([{ element: 1 }, { element2: 2 }], [{ element: 1 }, { element2: 2 }]);
    expect(res).toEqual(true);
  });
});
