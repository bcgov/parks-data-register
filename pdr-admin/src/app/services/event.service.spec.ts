import { TestBed } from '@angular/core/testing';
import { EventKeywords, EventObject, EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;

  let mockErrorEvent = new EventObject(
    EventKeywords.ERROR,
    'Mock error event occurred',
    'Event Service'
  );

  let mockInfoEvent = new EventObject(
    EventKeywords.INFO,
    'Mock info event occurred',
    'Event Service'
  );

  let mockDebugEvent = new EventObject(
    EventKeywords.DEBUG,
    'Mock debug event occurred',
    'Event Service'
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
    });
    service = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('handles error events', async () => {
    service.setError(mockErrorEvent);
    expect(service['errorEvent'].value).toEqual(mockErrorEvent);
    service.getError().subscribe((res) => {
      expect(res).toEqual(mockErrorEvent);
    });
  });

  it('handles info events', async () => {
    service.setInfo(mockInfoEvent);
    expect(service['infoEvent'].value).toEqual(mockInfoEvent);
    service.getInfo().subscribe((res) => {
      expect(res).toEqual(mockInfoEvent);
    });
  });

  it('handles debug events', async () => {
    service.setDebug(mockDebugEvent);
    expect(service['debugEvent'].value).toEqual(mockDebugEvent);
    service.getDebug().subscribe((res) => {
      expect(res).toEqual(mockDebugEvent);
    });
  });
});
