import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    // put mockData inside beforeEach, otherwise mutations persist across tests!
    const mockData = {
      mock1: new BehaviorSubject('value1'),
      mock2: new BehaviorSubject(['value21, value22, value23']),
      mock3: new BehaviorSubject({ mock31: 'value31' }),
    };
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
    service['data'] = mockData;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.getItemValue('mock1')).toEqual('value1');
    expect(service.getItemValue('mock2')).toEqual([
      'value21, value22, value23',
    ]);
    expect(service.getItemValue('mock3')).toEqual({ mock31: 'value31' });
  });

  it('inits and sets new data tag', async () => {
    service.initItem('mock4');
    expect(service.getItemValue('mock4')).toEqual(null);
    service.setItemValue('mock4', 'value4');
    expect(service.getItemValue('mock4')).toEqual('value4');
    service.clearItemValue('mock4');
    expect(service.getItemValue('mock4')).toEqual(null);
  });

  it('appends data to existing tag', async () => {
    const createNewSpy = spyOn(service, 'setItemValue').and.callThrough();
    // create new tag if it doesn't exist already
    service.appendItemValue('mock5', 'value5');
    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(service.getItemValue('mock5')).toEqual('value5');
    // append new value to existing array tag
    service.appendItemValue('mock2', 'value24');
    expect(service.getItemValue('mock2')).toEqual([
      'value21, value22, value23',
      'value24',
    ]);
  });

  it('merges data with existing data', async () => {
    const createNewSpy = spyOn(service, 'setItemValue').and.callThrough();
    // create new tag if it doesn't exist already
    service.mergeItemValue('mock6', 'value6');
    expect(createNewSpy).toHaveBeenCalledTimes(1);
    expect(service.getItemValue('mock6')).toEqual('value6');
    // merge new value with existing object tag
    service.mergeItemValue('mock3', { mock32: 'value32' });
    expect(service.getItemValue('mock3')).toEqual({
      mock31: 'value31',
      mock32: 'value32',
    });
  });

  it('provides a subscription point for watching data', async () => {
    expect(service.watchItem('mock1').value).toEqual('value1');
  });
});
