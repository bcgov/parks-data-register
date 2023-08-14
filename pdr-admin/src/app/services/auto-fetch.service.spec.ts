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

  // it('fetches the queue', async () => {
  //   const fetchSpy = spyOn(service, 'runFetches').and.callThrough();
  //   const parkSpy = spyOn(service['parkService'], 'fetchData');
  //   await service.run();
  //   expect(fetchSpy).toHaveBeenCalledTimes(1);
  //   expect(parkSpy).toHaveBeenCalledTimes(1);
  //   jasmine.clock().tick(1001);
  //   expect(fetchSpy).toHaveBeenCalledTimes(2);
  //   expect(parkSpy).toHaveBeenCalledTimes(2);
  // });
});
