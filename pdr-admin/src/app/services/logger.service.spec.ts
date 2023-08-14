import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { LoggerService, LogLevel } from './logger.service';
import { ConfigService } from './config.service';

describe('LoggerService', () => {
  let service: LoggerService;

  let mockConfigService = {
    logLevel: LogLevel.Info,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        HttpClient,
        HttpHandler,
      ],
    });
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('decides whether to show the log', async () => {
    expect(service['shouldLog'](LogLevel.Debug)).toBeFalse();
    expect(service['shouldLog'](LogLevel.Info)).toBeTrue();
    expect(service['shouldLog'](LogLevel.Warn)).toBeTrue();
  });

  it('logs to the console', async () => {
    const stringCastSpy = spyOn<any>(
      service,
      'entryToString'
    ).and.callThrough();
    service.log('mock ignored message');
    expect(stringCastSpy).not.toHaveBeenCalled();
    service.log('LoggerService test: mock info message - PASS', LogLevel.Info);
    expect(stringCastSpy).toHaveBeenCalledTimes(1);
  });

  it('logs at the specified levels', async () => {
    const logSpy = spyOn(service, 'log');
    // debug
    service.debug('debug');
    expect(logSpy).toHaveBeenCalledOnceWith('debug', LogLevel.Debug);
    logSpy.calls.reset();
    // info
    service.info('info');
    expect(logSpy).toHaveBeenCalledOnceWith('info', LogLevel.Info);
    logSpy.calls.reset();
    // warn
    service.warn('warn');
    expect(logSpy).toHaveBeenCalledOnceWith('warn', LogLevel.Warn);
    logSpy.calls.reset();
    // error
    service.error('error');
    expect(logSpy).toHaveBeenCalledOnceWith('error', LogLevel.Error);
    logSpy.calls.reset();
    // fatal
    service.fatal('fatal');
    expect(logSpy).toHaveBeenCalledOnceWith('fatal', LogLevel.Fatal);
    logSpy.calls.reset();
  });
});
